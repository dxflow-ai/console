<template>
    <HeaderLine>
        <template #tags>
            <UiBadge size="sm" variant="outline" color="teal">
                <span>Tags</span>
            </UiBadge>
        </template>
        <template #title>
            <span class="font-bold text-2xl text-nowrap">Sessions</span>
        </template>
        <template #actions>
            <UiTooltip
                text="Prune Sessions"
                :delay-duration="750"
                :content="{
                    side: 'left',
                }"
            >
                <UiButton
                    icon="i-mingcute:broom-line"
                    size="sm"
                    variant="outline"
                    color="neutral"
                    :loading="pruning"
                    @click="confirmPrune.open()"
                    square
                />
            </UiTooltip>
            <UiTooltip
                text="Create Session"
                :delay-duration="750"
                :content="{
                    side: 'left',
                }"
            >
                <UiButton
                    icon="i-mingcute:add-line"
                    size="sm"
                    variant="outline"
                    color="neutral"
                    :loading="creating"
                    @click="createAction()"
                    square
                />
            </UiTooltip>
        </template>
        <template #options>
            <StatBadge label="Total" :value="orderedShells.length" />
        </template>
    </HeaderLine>
    <UiCard
        id="element"
        :ui="{
            root: 'flex flex-1 flex-col',
            body: 'flex flex-1 h-full flex-col p-0!',
        }"
    >
        <UiTable
            v-model:row-selection="selected"
            :columns="columns"
            :data="orderedShells"
            :loading="loading"
            :ui="{
                empty: 'hidden',
            }"
            sticky
        >
            <template #identity-header>
                <TableColumnHeader icon="i-mingcute:terminal-line" label="Identity" />
            </template>
            <template #identity-cell="{ row }">
                <div class="flex items-center gap-2 select-none">
                    <TableRowSelect :selected="row.getIsSelected()" @toggle="row.toggleSelected()" />
                    <span>{{ row.original.identity }}</span>
                </div>
            </template>
            <template #state-header>
                <TableColumnHeader icon="i-mingcute:tag-line" label="State" />
            </template>
            <template #state-cell="{ row }">
                <ShellStateBadge :state="row.original.state" />
            </template>
            <template #path-header>
                <TableColumnHeader icon="i-mingcute:lightning-line" label="Path" />
            </template>
            <template #path-cell="{ row }">
                <div class="text-xs text-muted max-w-72">
                    <TruncateText :value="row.original.path" :start="24" :end="32" />
                </div>
            </template>
            <template #created_at-header>
                <TableColumnHeader icon="i-mingcute:calendar-2-line" label="Created At" />
            </template>
            <template #created_at-cell="{ row }">
                <div class="text-xs text-muted">
                    <DateLabel
                        class="text-xs"
                        month="short"
                        day="numeric"
                        hour="numeric"
                        minute="numeric"
                        :timestamp="row.original.created_at"
                    />
                </div>
            </template>
            <template #actions-header>
                <TableRemoveAction
                    :visible="!!selectedIdentities.length"
                    :loading="removingBatch"
                    @click="confirmRemoveBatch.open()"
                />
            </template>
            <template #actions-cell="{ row }">
                <div class="flex items-center justify-end gap-1.5">
                    <UiButton
                        label="View"
                        leading-icon="i-mingcute:upload-2-line"
                        size="xs"
                        variant="soft"
                        color="primary"
                        @click="openDrawer(row.original)"
                    />
                    <MoreOptions :key="moreOptionsKey" :items="getActions(row.original)" />
                </div>
            </template>
        </UiTable>
        <template v-if="empty">
            <EmptyPlaceholder title="No Sessions Available" description="Create a new one" />
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
                <UiIcon name="i-mingcute:terminal-line" class="size-6 text-primary" />
                <div class="flex items-center gap-4">
                    <span class="text-xl font-bold">{{ displayed?.identity }}</span>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <UiButton
                    icon="i-mingcute:close-line"
                    size="xs"
                    variant="ghost"
                    color="neutral"
                    @click="closeDrawer()"
                    square
                />
            </div>
        </template>
        <template #body>
            <template v-if="displayed">
                <Terminal class="h-[64dvh] rounded-sm" :identity="displayed.identity" />
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
    middleware: "guard",
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
