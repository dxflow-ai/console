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
                <span>Tags</span>
            </UiBadge>
        </template>
        <template #title>
            <span class="font-bold text-2xl text-nowrap">Sessions</span>
        </template>
        <template #actions>
            <UiTooltip
                :delay-duration="750"
                :content="{
                    side: 'left',
                }"
                text="Prune Sessions"
            >
                <UiButton
                    :loading="pruning"
                    :ui="{
                        base: 'rounded-full',
                    }"
                    size="sm"
                    variant="outline"
                    color="neutral"
                    @click="confirmPrune.open()"
                    square
                >
                    <template v-if="!pruning">
                        <UiIcon name="i-mingcute:broom-line" />
                    </template>
                </UiButton>
            </UiTooltip>
            <UiTooltip
                :delay-duration="750"
                :content="{
                    side: 'left',
                }"
                text="Create Session"
            >
                <UiButton
                    :loading="creating"
                    :ui="{
                        base: 'rounded-full',
                    }"
                    size="sm"
                    variant="outline"
                    color="neutral"
                    @click="createAction()"
                    square
                >
                    <template v-if="!creating">
                        <UiIcon name="i-mingcute:add-line" />
                    </template>
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
                <small class="font-bold">{{ orderedShells.length }}</small>
            </UiBadge>
        </template>
    </HeaderLine>
    <UiCard
        id="element"
        :ui="{
            root: 'relative flex flex-1 flex-col rounded-none ring-0 animate-fade animate-delay-800',
            body: 'flex flex-1 h-full flex-col p-0!',
        }"
    >
        <UiTable
            v-model:row-selection="selected"
            :columns="columns"
            :data="orderedShells"
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
                    <UiIcon name="i-mingcute:terminal-line" class="size-3.5" />
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
                    <span>{{ row.original.identity }}</span>
                </div>
            </template>
            <template #state-header>
                <div class="flex items-center gap-2">
                    <UiIcon name="i-mingcute:tag-line" class="size-3.5" />
                    <span>State</span>
                </div>
            </template>
            <template #state-cell="{ row }">
                <ShellStateBadge :state="row.original.state" />
            </template>
            <template #path-header>
                <div class="flex items-center gap-2">
                    <UiIcon name="i-mingcute:lightning-line" class="size-3.5" />
                    <span>Path</span>
                </div>
            </template>
            <template #path-cell="{ row }">
                <div class="text-xs opacity-75 max-w-72">
                    <TruncateText :value="row.original.path" :start="24" :end="32" />
                </div>
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
                <div
                    :class="selectedIdentities.length ? 'animate-fade' : 'opacity-0 pointer-events-none'"
                    class="flex items-center justify-end"
                >
                    <UiButton
                        :loading="removingBatch"
                        :ui="{
                            base: 'flex items-center justify-center gap-1.5',
                        }"
                        size="xs"
                        variant="soft"
                        color="red"
                        @click="confirmRemoveBatch.open()"
                    >
                        <span>Remove</span>
                        <template v-if="!removingBatch">
                            <UiIcon name="i-mingcute:delete-3-line" class="size-3.5" />
                        </template>
                    </UiButton>
                </div>
            </template>
            <template #actions-cell="{ row }">
                <div class="flex items-center justify-end gap-1.5">
                    <UiButton
                        :ui="{
                            base: 'flex items-center justify-center gap-1.5',
                        }"
                        size="xs"
                        variant="soft"
                        color="primary"
                        @click="openDrawer(row.original)"
                    >
                        <UiIcon name="i-mingcute:upload-2-line" class="size-3.5" />
                        <span>View</span>
                    </UiButton>
                    <MoreOptions :key="moreOptionsKey" :items="getActions(row.original)" />
                </div>
            </template>
        </UiTable>
        <template v-if="empty">
            <div class="flex flex-col flex-1 items-center justify-center gap-4">
                <EmptyPlaceholder />
                <div class="flex flex-col items-center gap-1 animate-fade">
                    <span class="text-sm">No Sessions Available</span>
                    <span class="text-xs opacity-50">Create a new one</span>
                </div>
            </div>
        </template>
    </UiCard>
    <UiDrawer
        :open="drawer"
        :handle="false"
        :dismissible="false"
        :ui="{
            overlay: 'absolute inset-0 bg-elevated/75',
            content: 'absolute bg-default ring ring-default flex focus:outline-none',
            header: 'flex items-center justify-between',
        }"
    >
        <template #header>
            <div class="flex items-center gap-2">
                <UiIcon name="i-mingcute:terminal-line" class="size-6 text-primary-500" />
                <div class="flex items-center gap-4">
                    <span class="text-xl font-black">{{ displayed?.identity }}</span>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <UiButton size="xs" variant="ghost" color="neutral" @click="closeDrawer()" square>
                    <UiIcon name="i-mingcute:close-line" class="size-3.5" />
                </UiButton>
            </div>
        </template>
        <template #body>
            <template v-if="displayed">
                <Terminal :identity="displayed.identity" class="h-[64dvh] rounded-sm" />
            </template>
        </template>
    </UiDrawer>
</template>

<script lang="ts" setup>
import { sleep } from "radash";

import type { DeepReadonly } from "vue";
import type { TableColumn } from "@nuxt/ui";

definePageMeta({
    name: "shell-sessions",
    layout: "console",
});

const { data: orderedShells } = useStoreView(shellStore, "list");
const { execute: loadShells, loading } = useStoreAction(shellStore, "get");
const { execute: resetShells } = useStoreAction(shellStore, "reset");

const confirmRemoveShell = useConfirmToast({
    id: "shell-remove-confirm",
    icon: "i-mingcute:delete-3-line",
    color: "red",
    title() {
        return "Remove Shell";
    },
    description(payload: { identity: string }) {
        return `Are you sure you want to remove '${payload.identity}'?`;
    },
    confirm(payload: { identity: string }) {
        removeAction(payload);
    },
    cancel() {
        moreOptionsKey.value++;
    },
});

const confirmRemoveBatch = useConfirmToast({
    id: "shell-remove-batch-confirm",
    icon: "i-mingcute:delete-3-line",
    color: "red",
    title() {
        return "Remove Sessions";
    },
    description() {
        return `Are you sure you want to remove ${selectedIdentities.value.length} sessions?`;
    },
    confirm() {
        removeBatchAction();
    },
});

const confirmPrune = useConfirmToast({
    id: "shell-prune-confirm",
    icon: "i-mingcute:broom-line",
    color: "red",
    title() {
        return "Prune Sessions";
    },
    description() {
        return "Remove all exited and failed sessions?";
    },
    confirm() {
        pruneAction();
    },
});

const columns: TableColumn<DeepReadonly<Shell>>[] = [
    {
        id: "identity",
        meta: { class: { th: "w-48" } },
    },
    {
        id: "state",
        meta: { class: { th: "w-48" } },
    },
    {
        id: "path",
    },
    {
        id: "created_at",
        meta: { class: { th: "w-32" } },
    },
    {
        id: "actions",
        meta: { class: { th: "w-64" } },
    },
];

const creating = ref(false);
const pruning = ref(false);

const removing = ref<MaybeString>();
const removingBatch = ref(false);
const executing = ref<MaybeString>();
const killing = ref<MaybeString>();

const moreOptionsKey = ref(0);

const drawer = ref(false);
const displayed = ref<Maybe<DeepReadonly<Shell>>>();

const selected = ref<Record<number, boolean>>({});
const selectedIdentities = computed(() => {
    const identities: string[] = [];
    for (const index in selected.value) {
        if (selected.value[index] && orderedShells.value[index]?.identity) {
            identities.push(orderedShells.value[index].identity);
        }
    }

    return identities;
});

const empty = computed(() => {
    return !orderedShells.value.length && !loading.value;
});

watch(orderedShells, () => {
    selected.value = {};
});

function getActions(shell: DeepReadonly<Shell>): any {
    const canExecute = ["created", "killed", "exited", "failed"].includes(shell.state);
    const canKill = shell.state === "executed";
    return [
        {
            label: "Execute",
            icon: "i-mingcute:play-line",
            loading: executing.value === shell.identity,
            hidden: !canExecute,
            onClick() {
                executeAction(shell);
            },
        },
        {
            label: "Kill",
            icon: "i-mingcute:lightning-line",
            loading: killing.value === shell.identity,
            hidden: !canKill,
            onClick() {
                killAction(shell);
            },
        },
        {
            label: "Remove",
            icon: "i-mingcute:delete-3-line",
            color: "red",
            loading: removing.value === shell.identity,
            onClick() {
                confirmRemoveShell.open(shell);
            },
        },
    ];
}

function openDrawer(shell: DeepReadonly<Shell>) {
    displayed.value = shell;

    sleep(250).then(() => {
        drawer.value = true;
    });
}

function closeDrawer() {
    drawer.value = false;

    sleep(250).then(() => {
        displayed.value = null;
    });
}

async function load() {
    await loadShells();
}

async function createAction() {
    creating.value = true;

    try {
        await shellStore.action.create();
    } catch (error) {
        dangerToast("Failed to create shell", error as Error);
    }

    creating.value = false;
}

async function executeAction({ identity }: Pick<DeepReadonly<Shell>, "identity">) {
    executing.value = identity;

    try {
        await shellStore.action.executeById({ payload: { identity } });
    } catch (error) {
        executing.value = null;
        return dangerToast(`Failed to execute '${identity}'`, error as Error);
    }

    executing.value = null;
    moreOptionsKey.value++;
}

async function killAction({ identity }: Pick<DeepReadonly<Shell>, "identity">) {
    killing.value = identity;

    try {
        await shellStore.action.killById({ payload: { identity } });
    } catch (error) {
        killing.value = null;
        return dangerToast(`Failed to kill '${identity}'`, error as Error);
    }

    killing.value = null;
    moreOptionsKey.value++;
}

async function removeAction({ identity }: Pick<DeepReadonly<Shell>, "identity">) {
    removing.value = identity;

    try {
        await shellStore.action.removeById({ payload: { identity } });
    } catch (error) {
        removing.value = null;
        return dangerToast(`Failed to remove '${identity}'`, error as Error);
    }

    removing.value = null;
    moreOptionsKey.value++;
}

async function removeBatchAction() {
    removingBatch.value = true;

    try {
        await shellStore.action.removeBatch({ payload: { identities: selectedIdentities.value } });
    } catch (error) {
        dangerToast("Failed to remove batch", error as Error);
    }

    removingBatch.value = false;
}

async function pruneAction() {
    pruning.value = true;

    try {
        await shellStore.action.prune();
    } catch (error) {
        dangerToast("Failed to prune sessions", error as Error);
    }

    pruning.value = false;
}

useHead({
    title: "Active Sessions",
});

onMounted(() => {
    load();
});

onBeforeUnmount(() => {
    resetShells();
});
</script>
