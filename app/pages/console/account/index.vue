<template>
    <HeaderLine>
        <template #tags>
            <UiBadge
                :ui="{
                    base: 'rounded-full',
                }"
                size="sm"
                variant="outline"
                color="teal"
            >
                <span>Accounts</span>
            </UiBadge>
        </template>
        <template #title>
            <span class="font-bold text-2xl text-nowrap">Accounts</span>
        </template>
        <template #actions>
            <UiTooltip
                :delay-duration="750"
                :content="{
                    side: 'left',
                }"
                text="New Account"
            >
                <UiButton
                    :disabled="creating"
                    :ui="{
                        base: 'rounded-full',
                    }"
                    size="sm"
                    variant="outline"
                    color="neutral"
                    @click="openCreateModal()"
                    square
                >
                    <UiIcon name="i-lucide:plus" />
                    <Loading :active="creating" />
                </UiButton>
            </UiTooltip>
        </template>
        <template #options>
            <UiBadge
                :ui="{
                    base: 'rounded-full gap-1 text-nowrap',
                }"
                variant="soft"
                color="neutral"
            >
                <small class="text-muted">Total</small>
                <small class="font-bold">{{ orderedAccounts.length }}</small>
            </UiBadge>
        </template>
    </HeaderLine>
    <UiCard
        :ui="{
            root: 'relative flex flex-1 flex-col rounded-none ring-0 animate-fade animate-delay-800',
            body: 'flex flex-1 h-full flex-col p-0!',
        }"
    >
        <UiTable
            v-model:row-selection="selected"
            :columns="columns"
            :data="orderedAccounts"
            :loading="loading"
            :ui="{
                root: 'rounded-none',
                thead: 'before:absolute before:w-full before:h-px before:bottom-0 before:left-0 before:bg-accented/50',
                tbody: 'divide-none',
                th: 'bg-elevated first:rounded-tl-sm last:rounded-tr-sm',
                td: 'border-b border-b-(--ui-border)/25',
                separator: 'hidden',
                empty: 'hidden',
            }"
            sticky
        >
            <template #identity-header>
                <div class="flex items-center gap-2">
                    <UiIcon name="i-mingcute:fingerprint-line" class="size-3.5" />
                    <span>Identity</span>
                </div>
            </template>
            <template #identity-cell="{ row }">
                <div class="flex items-center gap-2 select-none">
                    <div class="relative flex size-3.5 items-center justify-center">
                        <UiCheckbox
                            :model-value="row.getIsSelected()"
                            :ui="{
                                base: 'rounded-xs pointer-events-none',
                                icon: 'size-3',
                            }"
                            size="sm"
                        />
                        <div class="absolute -inset-2 rounded-md cursor-pointer" @click="row.toggleSelected()" />
                    </div>
                    <TruncateText :value="row.original.identity" :length="16" class="font-mono text-sm" />
                </div>
            </template>
            <template #email-header>
                <div class="flex items-center gap-2">
                    <UiIcon name="i-mingcute:mail-line" class="size-3.5" />
                    <span>Email</span>
                </div>
            </template>
            <template #email-cell="{ row }">
                <span class="text-sm">{{ row.original.email }}</span>
            </template>
            <template #name-header>
                <div class="flex items-center gap-2">
                    <UiIcon name="i-mingcute:user-3-line" class="size-3.5" />
                    <span>Name</span>
                </div>
            </template>
            <template #name-cell="{ row }">
                <span class="text-sm">{{ row.original.name || "-" }}</span>
            </template>
            <template #authenticator-header>
                <div class="flex items-center gap-2">
                    <UiIcon name="i-mingcute:key-2-line" class="size-3.5" />
                    <span>Authenticator</span>
                </div>
            </template>
            <template #authenticator-cell="{ row }">
                <AccountAuthenticatorBadge :authenticator="row.original.authenticator" />
            </template>
            <template #disabled-header>
                <div class="flex items-center gap-2">
                    <UiIcon name="i-mingcute:tag-line" class="size-3.5" />
                    <span>Status</span>
                </div>
            </template>
            <template #disabled-cell="{ row }">
                <AccountStatusBadge :disabled="row.original.disabled" />
            </template>
            <template #created_at-header>
                <div class="flex items-center gap-2">
                    <UiIcon name="i-mingcute:calendar-2-line" class="size-3.5" />
                    <span>Created At</span>
                </div>
            </template>
            <template #created_at-cell="{ row }">
                <div class="text-xs opacity-75">
                    <DateLabel
                        :timestamp="row.original.created_at"
                        class="text-xs"
                        month="short"
                        day="numeric"
                        hour="numeric"
                        minute="numeric"
                    />
                </div>
            </template>
            <template #actions-header>
                <Animate
                    :class="{
                        'pointer-events-none': !selectedIdentities.length,
                    }"
                    :state="!!selectedIdentities.length"
                    :attributes="{
                        opacity: [0, 1],
                    }"
                    class="flex items-center justify-end"
                >
                    <UiButton
                        :disabled="deletingBatch"
                        :ui="{
                            base: 'flex items-center justify-center gap-1.5',
                        }"
                        size="xs"
                        variant="soft"
                        color="red"
                        @click="confirmDeleteBatch.open()"
                    >
                        <span>Delete</span>
                        <UiIcon name="i-mingcute:delete-3-line" class="size-3.5" />
                        <Loading :active="deletingBatch" />
                    </UiButton>
                </Animate>
            </template>
            <template #actions-cell="{ row }">
                <div class="flex items-center justify-end gap-1.5">
                    <MoreOptions :key="moreOptionsKey" :items="getActions(row.original)" />
                </div>
            </template>
        </UiTable>
        <template v-if="empty">
            <div class="flex flex-col flex-1 items-center justify-center gap-4">
                <EmptyPlaceholder />
                <div class="flex flex-col items-center gap-1 animate-fade">
                    <span class="text-sm">No Accounts Available</span>
                    <span class="text-xs opacity-50">Accounts are created when users authenticate</span>
                </div>
            </div>
        </template>
    </UiCard>
    <LicenseAccountCreateModal v-model="createModalState" :creating="creating" @create="create" />
</template>

<script lang="ts" setup>
import Animate from "~/components/Animate.vue";
import DateLabel from "~/components/DateLabel.vue";
import EmptyPlaceholder from "~/components/EmptyPlaceholder.vue";
import Loading from "~/components/Loading.vue";
import TruncateText from "~/components/TruncateText.vue";
import MoreOptions from "~/components/MoreOptions.vue";
import HeaderLine from "~/components/HeaderLine.vue";
import LicenseAccountCreateModal from "~/components/LicenseAccountCreateModal.vue";
import AccountAuthenticatorBadge from "~/components/AccountAuthenticatorBadge.vue";
import AccountStatusBadge from "~/components/AccountStatusBadge.vue";

import type { TableColumn } from "@nuxt/ui";

definePageMeta({
    name: "account",
    layout: "console",
});

const { data: orderedAccounts } = useStoreView(accountStore, "ordered");
const { execute: loadAccounts, loading } = useStoreAction(accountStore, "load");
const { execute: resetAccounts } = useStoreAction(accountStore, "reset");

const confirmDelete = useConfirmToast({
    id: "account-delete-confirm",
    icon: "i-mingcute:delete-3-line",
    color: "red",
    title() {
        return "Delete Account";
    },
    description(payload: Account) {
        return `Are you sure you want to delete account '${payload.name || payload.email}'? This will remove all associated licenses.`;
    },
    confirm(payload: Account) {
        deleteAction(payload);
    },
    cancel() {
        moreOptionsKey.value++;
    },
});

const confirmDeleteBatch = useConfirmToast({
    id: "account-delete-batch-confirm",
    icon: "i-mingcute:delete-3-line",
    color: "red",
    title() {
        return "Delete Accounts";
    },
    description() {
        return `Are you sure you want to delete ${selectedIdentities.value.length} accounts?`;
    },
    confirm() {
        deleteBatchAction();
    },
});

const columns: TableColumn<DeepReadonly<Account>>[] = [
    {
        id: "identity",
        meta: { class: { th: "w-48" } },
    },
    {
        id: "email",
    },
    {
        id: "name",
        meta: { class: { th: "w-48" } },
    },
    {
        id: "authenticator",
        meta: { class: { th: "w-32" } },
    },
    {
        id: "disabled",
        meta: { class: { th: "w-24" } },
    },
    {
        id: "created_at",
        meta: { class: { th: "w-36" } },
    },
    {
        id: "actions",
        meta: { class: { th: "w-24" } },
    },
];

const creating = ref(false);
const deleting = ref<string | null>(null);
const deletingBatch = ref(false);

const moreOptionsKey = ref(0);
const createModalState = ref(false);

const selected = ref<Record<number, boolean>>({});
const selectedIdentities = computed(() => {
    const identities: string[] = [];
    for (const index in selected.value) {
        if (selected.value[index] && orderedAccounts.value[index]?.identity) {
            identities.push(orderedAccounts.value[index].identity);
        }
    }

    return identities;
});

const empty = computed(() => {
    return !orderedAccounts.value.length && !loading.value;
});

watch(orderedAccounts, () => {
    selected.value = {};
});

function getActions(account: DeepReadonly<Account>): any {
    return [
        {
            label: "Delete",
            icon: "i-mingcute:delete-3-line",
            color: "red",
            loading: deleting.value === account.identity,
            onClick() {
                confirmDelete.open(account);
            },
        },
    ];
}

function openCreateModal() {
    createModalState.value = true;
}

async function load() {
    await loadAccounts();
}

async function create(data: Partial<Account>) {
    creating.value = true;

    try {
        const result = await accountStore.action.create({ payload: data });
        await sleep(500);
        creating.value = false;

        if (result) {
            createModalState.value = false;
            successToast("Account Created", `Account '${result.name || result.email}' has been created successfully`);
        }
    } catch (error) {
        await sleep(500);
        creating.value = false;
        dangerToast("Failed to create account", error as Error);
    }
}

async function deleteAction(account: DeepReadonly<Account>) {
    deleting.value = account.identity;

    try {
        await accountStore.action.remove({ payload: { identity: account.identity } });
        await sleep(500);
        deleting.value = null;
        moreOptionsKey.value++;
        successToast("Account Deleted", `Account '${account.name || account.email}' has been deleted successfully`);
    } catch (error) {
        await sleep(500);
        deleting.value = null;
        moreOptionsKey.value++;
        dangerToast(`Failed to delete account`, error as Error);
    }
}

async function deleteBatchAction() {
    const identities = [...selectedIdentities.value];

    deletingBatch.value = true;

    try {
        await accountStore.action.removeBatch({ payload: { identities } });
        await sleep(500);
        deletingBatch.value = false;
        selected.value = {};
        successToast("Accounts Deleted", `${identities.length} accounts have been deleted successfully`);
    } catch (error) {
        await sleep(500);
        deletingBatch.value = false;
        dangerToast("Failed to delete accounts", error as Error);
    }
}

useHead({
    title: "Accounts",
});

onMounted(() => {
    load();
});

onBeforeUnmount(() => {
    resetAccounts();
});
</script>
