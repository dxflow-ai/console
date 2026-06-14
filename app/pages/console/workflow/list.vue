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
                <span>Workflows</span>
            </UiBadge>
        </template>
        <template #title>
            <span class="font-bold text-2xl text-nowrap">Workflows</span>
        </template>
        <template #actions>
            <UiTooltip
                :delay-duration="750"
                :content="{
                    side: 'left',
                }"
                text="Prune Workflows"
            >
                <UiButton
                    :disabled="pruning"
                    :ui="{
                        base: 'rounded-full',
                    }"
                    size="sm"
                    variant="outline"
                    color="neutral"
                    @click="confirmPrune.open()"
                    square
                >
                    <UiIcon name="i-mingcute:broom-line" />
                    <Loading :active="pruning" />
                </UiButton>
            </UiTooltip>
            <UiTooltip
                :delay-duration="750"
                :content="{
                    side: 'left',
                }"
                text="Create Workflow"
            >
                <UiButton
                    :disabled="creating"
                    :ui="{
                        base: 'rounded-full',
                    }"
                    size="sm"
                    variant="outline"
                    color="neutral"
                    @click="openCreateDrawer()"
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
                <small class="font-bold">{{ orderedWorkflows.length }}</small>
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
            :data="orderedWorkflows"
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
                    <UiIcon name="i-mingcute:git-branch-line" class="size-3.5" />
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
                    <span class="font-mono text-sm">{{ row.original.identity }}</span>
                </div>
            </template>
            <template #name-header>
                <div class="flex items-center gap-2">
                    <UiIcon name="i-mingcute:file-line" class="size-3.5" />
                    <span>Name</span>
                </div>
            </template>
            <template #name-cell="{ row }">
                <span class="text-sm">{{ row.original.name }}</span>
            </template>
            <template #status-header>
                <div class="flex items-center gap-2">
                    <UiIcon name="i-mingcute:tag-line" class="size-3.5" />
                    <span>Status</span>
                </div>
            </template>
            <template #status-cell="{ row }">
                <WorkflowStatusBadge :status="row.original.status" />
            </template>
            <template #tags-header>
                <div class="flex items-center gap-2">
                    <UiIcon name="i-mingcute:tag-2-line" class="size-3.5" />
                    <span>Tags</span>
                </div>
            </template>
            <template #tags-cell="{ row }">
                <div class="flex items-center gap-1">
                    <template v-for="tag in row.original.tags.slice(0, 3)" :key="tag">
                        <UiBadge
                            :ui="{
                                base: 'rounded-full',
                            }"
                            size="xs"
                            variant="soft"
                            color="neutral"
                        >
                            {{ tag }}
                        </UiBadge>
                    </template>
                    <template v-if="row.original.tags.length > 3">
                        <UiBadge
                            :ui="{
                                base: 'rounded-full',
                            }"
                            size="xs"
                            variant="soft"
                            color="neutral"
                        >
                            +{{ row.original.tags.length - 3 }}
                        </UiBadge>
                    </template>
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
                        :disabled="removingBatch"
                        :ui="{
                            base: 'flex items-center justify-center gap-1.5',
                        }"
                        size="xs"
                        variant="soft"
                        color="red"
                        @click="confirmRemoveBatch.open()"
                    >
                        <span>Remove</span>
                        <UiIcon name="i-mingcute:delete-3-line" class="size-3.5" />
                        <Loading :active="removingBatch" />
                    </UiButton>
                </Animate>
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
                        @click="openDetailDrawer(row.original)"
                    >
                        <UiIcon name="i-mingcute:eye-line" class="size-3.5" />
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
                    <span class="text-sm">No Workflows Available</span>
                    <span class="text-xs opacity-50">Create a new workflow</span>
                </div>
            </div>
        </template>
    </UiCard>
    <!-- Create Workflow Drawer -->
    <UiDrawer
        :open="createDrawer"
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
                <UiIcon name="i-mingcute:git-branch-line" class="size-6 text-primary-500" />
                <span class="text-xl font-black">Create Workflow</span>
            </div>
            <div class="flex items-center gap-2">
                <UiButton size="xs" variant="ghost" color="neutral" @click="closeCreateDrawer()" square>
                    <UiIcon name="i-lucide:x" class="size-3.5" />
                </UiButton>
            </div>
        </template>
        <template #body>
            <div class="flex flex-col gap-4 p-4">
                <UiFormField label="Identity" hint="Optional unique identifier">
                    <UiInput
                        v-model="createForm.identity"
                        :ui="{
                            base: 'font-mono',
                        }"
                        placeholder="auto-generated if empty"
                    />
                </UiFormField>
                <UiFormField label="Workflow Definition" hint="dxflow YAML workflow definition" required>
                    <UiTextarea
                        v-model="createForm.source"
                        :rows="12"
                        :ui="{
                            base: 'font-mono text-xs',
                        }"
                        placeholder="name: my-workflow&#10;tags:&#10;  - example&#10;&#10;steps:&#10;  - name: step-1&#10;    platform: docker&#10;    mode: sequential&#10;    image: alpine:latest&#10;    command: [echo, hello]"
                    />
                </UiFormField>
                <div class="flex items-center justify-end gap-2">
                    <UiButton
                        :disabled="creating"
                        size="sm"
                        variant="outline"
                        color="neutral"
                        @click="closeCreateDrawer()"
                    >
                        <span>Cancel</span>
                    </UiButton>
                    <UiButton
                        :disabled="creating || !createForm.source"
                        size="sm"
                        variant="solid"
                        color="primary"
                        @click="createAction()"
                    >
                        <span>Create</span>
                        <Loading :active="creating" />
                    </UiButton>
                </div>
                <template v-if="createMessages.length">
                    <UiCard
                        :ui="{
                            root: 'ring-1 ring-neutral-200 dark:ring-neutral-800',
                            body: 'p-3',
                        }"
                    >
                        <div class="flex flex-col gap-1 max-h-32 overflow-y-auto">
                            <template v-for="(message, index) in createMessages" :key="index">
                                <span class="text-xs font-mono opacity-75">{{ message }}</span>
                            </template>
                        </div>
                    </UiCard>
                </template>
            </div>
        </template>
    </UiDrawer>
    <!-- Detail Workflow Drawer -->
    <UiDrawer
        :open="detailDrawer"
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
                <UiIcon name="i-mingcute:git-branch-line" class="size-6 text-primary-500" />
                <div class="flex items-center gap-4">
                    <span class="text-xl font-black">{{ displayed?.identity }}</span>
                    <template v-if="displayed">
                        <WorkflowStatusBadge :status="displayed.status" />
                    </template>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <UiButton size="xs" variant="ghost" color="neutral" @click="closeDetailDrawer()" square>
                    <UiIcon name="i-lucide:x" class="size-3.5" />
                </UiButton>
            </div>
        </template>
        <template #body>
            <template v-if="displayed">
                <div class="flex flex-col gap-4 p-4">
                    <!-- Workflow Info -->
                    <div class="flex flex-wrap items-center gap-4">
                        <div class="flex flex-col gap-1">
                            <span class="text-xs text-muted">Name</span>
                            <span class="text-sm font-medium">{{ displayed.name }}</span>
                        </div>
                        <div class="flex flex-col gap-1">
                            <span class="text-xs text-muted">Created</span>
                            <DateLabel
                                :timestamp="displayed.created_at"
                                class="text-sm"
                                month="short"
                                day="numeric"
                                hour="numeric"
                                minute="numeric"
                            />
                        </div>
                        <div class="flex flex-col gap-1">
                            <span class="text-xs text-muted">Tags</span>
                            <div class="flex items-center gap-1">
                                <template v-for="tag in displayed.tags" :key="tag">
                                    <UiBadge size="xs" variant="soft" color="neutral">{{ tag }}</UiBadge>
                                </template>
                            </div>
                        </div>
                    </div>
                    <!-- Actions -->
                    <div class="flex items-center gap-2">
                        <template v-if="canStart">
                            <UiButton
                                :disabled="starting === displayed.identity"
                                size="sm"
                                variant="soft"
                                color="green"
                                @click="startAction(displayed)"
                            >
                                <UiIcon name="i-mingcute:play-line" class="size-4" />
                                <span>Start</span>
                                <Loading :active="starting === displayed.identity" />
                            </UiButton>
                        </template>
                        <template v-if="canStop">
                            <UiButton
                                :disabled="stopping === displayed.identity"
                                size="sm"
                                variant="soft"
                                color="amber"
                                @click="stopAction(displayed)"
                            >
                                <UiIcon name="i-mingcute:stop-line" class="size-4" />
                                <span>Stop</span>
                                <Loading :active="stopping === displayed.identity" />
                            </UiButton>
                        </template>
                    </div>
                    <!-- Steps -->
                    <UiCard
                        :ui="{
                            root: 'ring-1 ring-neutral-200 dark:ring-neutral-800',
                            header: 'p-3 pb-0',
                            body: 'p-3',
                        }"
                    >
                        <template #header>
                            <div class="flex items-center justify-between">
                                <span class="text-sm font-bold">Steps</span>
                                <UiButton
                                    :disabled="loadingSteps"
                                    size="xs"
                                    variant="ghost"
                                    color="neutral"
                                    @click="loadSteps(displayed.identity)"
                                    square
                                >
                                    <UiIcon name="i-mingcute:refresh-2-line" class="size-3.5" />
                                    <Loading :active="loadingSteps" />
                                </UiButton>
                            </div>
                        </template>
                        <div class="flex flex-col gap-2 max-h-48 overflow-y-auto">
                            <template v-if="displayedSteps.length">
                                <template v-for="step in displayedSteps" :key="step.identity">
                                    <div class="flex items-center justify-between p-2 rounded-md bg-elevated/50">
                                        <div class="flex items-center gap-2">
                                            <span class="text-xs font-mono opacity-50">#{{ step.index }}</span>
                                            <span class="text-sm">{{ step.name }}</span>
                                        </div>
                                        <UiBadge :color="getStepStatusColor(step.status)" size="xs" variant="subtle">
                                            {{ step.status }}
                                        </UiBadge>
                                    </div>
                                </template>
                            </template>
                            <template v-else>
                                <div class="flex items-center justify-center py-4 opacity-50">
                                    <span class="text-xs">No steps available</span>
                                </div>
                            </template>
                        </div>
                    </UiCard>
                    <!-- Events -->
                    <UiCard
                        :ui="{
                            root: 'ring-1 ring-neutral-200 dark:ring-neutral-800',
                            header: 'p-3 pb-0',
                            body: 'p-3',
                        }"
                    >
                        <template #header>
                            <div class="flex items-center justify-between">
                                <span class="text-sm font-bold">Events</span>
                                <UiButton
                                    :disabled="loadingEvents"
                                    size="xs"
                                    variant="ghost"
                                    color="neutral"
                                    @click="loadEvents(displayed.identity)"
                                    square
                                >
                                    <UiIcon name="i-mingcute:refresh-2-line" class="size-3.5" />
                                    <Loading :active="loadingEvents" />
                                </UiButton>
                            </div>
                        </template>
                        <div class="flex flex-col gap-2 max-h-48 overflow-y-auto">
                            <template v-if="displayedEvents.length">
                                <template v-for="(event, index) in displayedEvents" :key="index">
                                    <div class="flex items-start gap-2 p-2 rounded-md bg-elevated/50">
                                        <DateLabel
                                            :timestamp="event.time"
                                            class="text-xs opacity-50 shrink-0"
                                            hour="numeric"
                                            minute="numeric"
                                            second="numeric"
                                        />
                                        <span class="text-xs">{{ event.message }}</span>
                                    </div>
                                </template>
                            </template>
                            <template v-else>
                                <div class="flex items-center justify-center py-4 opacity-50">
                                    <span class="text-xs">No events available</span>
                                </div>
                            </template>
                        </div>
                    </UiCard>
                </div>
            </template>
        </template>
    </UiDrawer>
</template>

<script lang="ts" setup>
import type { TableColumn } from "@nuxt/ui";

import Animate from "~/components/Animate.vue";
import DateLabel from "~/components/DateLabel.vue";
import EmptyPlaceholder from "~/components/EmptyPlaceholder.vue";
import Loading from "~/components/Loading.vue";
import MoreOptions from "~/components/MoreOptions.vue";
import HeaderLine from "~/components/HeaderLine.vue";
import WorkflowStatusBadge from "~/components/WorkflowStatusBadge.vue";

definePageMeta({
    name: "workflow-list",
    layout: "console",
});

const { data: orderedWorkflows } = useStoreView(workflowStore, "ordered");
const { execute: loadWorkflows, loading } = useStoreAction(workflowStore, "load");
const { execute: resetWorkflows } = useStoreAction(workflowStore, "reset");

const { execute: executeLoadSteps, loading: loadingSteps } = useStoreAction(workflowStore, "loadSteps", {
    isolated: true,
});

const { execute: executeLoadEvents, loading: loadingEvents } = useStoreAction(workflowStore, "loadEvents", {
    isolated: true,
});

const { data: stepsRecord } = useStoreView(workflowStore, "workflowSteps");
const { data: eventsRecord } = useStoreView(workflowStore, "workflowEvents");

const confirmRemoveWorkflow = useConfirmToast({
    id: "workflow-remove-confirm",
    icon: "i-mingcute:delete-3-line",
    color: "red",
    title() {
        return "Remove Workflow";
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
    id: "workflow-remove-batch-confirm",
    icon: "i-mingcute:delete-3-line",
    color: "red",
    title() {
        return "Remove Workflows";
    },
    description() {
        return `Are you sure you want to remove ${selectedIdentities.value.length} workflows?`;
    },
    confirm() {
        removeBatchAction();
    },
});

const confirmPrune = useConfirmToast({
    id: "workflow-prune-confirm",
    icon: "i-mingcute:broom-line",
    color: "red",
    title() {
        return "Prune Workflows";
    },
    description() {
        return "Remove all stopped and exited workflows?";
    },
    confirm() {
        pruneAction();
    },
});

const columns: TableColumn<DeepReadonly<Workflow>>[] = [
    {
        id: "identity",
        meta: { class: { th: "w-48" } },
    },
    {
        id: "name",
    },
    {
        id: "status",
        meta: { class: { th: "w-32" } },
    },
    {
        id: "tags",
        meta: { class: { th: "w-48" } },
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
const starting = ref<MaybeString>();
const stopping = ref<MaybeString>();

const moreOptionsKey = ref(0);

const createDrawer = ref(false);

const createForm = reactive({
    identity: "",
    source: "",
});

const createMessages = ref<string[]>([]);

const detailDrawer = ref(false);
const displayed = ref<Maybe<DeepReadonly<Workflow>>>();

const selected = ref<Record<number, boolean>>({});

const displayedSteps = computed(() => {
    if (!displayed.value) {
        return [];
    }

    return stepsRecord.value[displayed.value.identity] || [];
});

const displayedEvents = computed(() => {
    if (!displayed.value) {
        return [];
    }

    return eventsRecord.value[displayed.value.identity] || [];
});

const canStart = computed(() => {
    if (!displayed.value) {
        return false;
    }

    return ["created", "stopped", "exited"].includes(displayed.value.status);
});

const canStop = computed(() => {
    if (!displayed.value) {
        return false;
    }

    return displayed.value.status === "started";
});

const selectedIdentities = computed(() => {
    const identities: string[] = [];
    for (const index in selected.value) {
        if (selected.value[index] && orderedWorkflows.value[index]?.identity) {
            identities.push(orderedWorkflows.value[index].identity);
        }
    }

    return identities;
});

const empty = computed(() => {
    return !orderedWorkflows.value.length && !loading.value;
});

watch(orderedWorkflows, () => {
    selected.value = {};

    // Update displayed workflow if it changed
    if (displayed.value) {
        const updated = orderedWorkflows.value.find((w) => {
            return w.identity === displayed.value?.identity;
        });
        if (updated) {
            displayed.value = updated;
        }
    }
});

function getStepStatusColor(status: WorkflowStepStatus) {
    switch (status) {
        case "pending":
            return "neutral";
        case "running":
            return "green";
        case "exited":
            return "red";
        default:
            return "neutral";
    }
}

function getActions(workflow: DeepReadonly<Workflow>): any {
    const canStart = ["created", "stopped", "exited"].includes(workflow.status);
    const canStop = workflow.status === "started";
    return [
        {
            label: "Start",
            icon: "i-mingcute:play-line",
            loading: starting.value === workflow.identity,
            hidden: !canStart,
            onClick() {
                startAction(workflow);
            },
        },
        {
            label: "Stop",
            icon: "i-mingcute:stop-line",
            loading: stopping.value === workflow.identity,
            hidden: !canStop,
            onClick() {
                stopAction(workflow);
            },
        },
        {
            label: "Remove",
            icon: "i-mingcute:delete-3-line",
            color: "red",
            loading: removing.value === workflow.identity,
            onClick() {
                confirmRemoveWorkflow.open(workflow);
            },
        },
    ];
}

function openCreateDrawer() {
    createForm.identity = "";
    createForm.source = "";
    createMessages.value = [];

    sleep(250, () => {
        createDrawer.value = true;
    });
}

function closeCreateDrawer() {
    createDrawer.value = false;
}

function openDetailDrawer(workflow: DeepReadonly<Workflow>) {
    displayed.value = workflow;

    sleep(250, () => {
        detailDrawer.value = true;
        loadSteps(workflow.identity);
        loadEvents(workflow.identity);
    });
}

function closeDetailDrawer() {
    detailDrawer.value = false;

    sleep(250, () => {
        displayed.value = null;
    });
}

async function load() {
    await loadWorkflows();
}

async function loadSteps(identity: string) {
    try {
        await executeLoadSteps({ payload: { identity } });
    } catch (error) {
        dangerToast("Failed to load steps", error as Error);
    }
}

async function loadEvents(identity: string) {
    try {
        await executeLoadEvents({ payload: { identity } });
    } catch (error) {
        dangerToast("Failed to load events", error as Error);
    }
}

async function createAction() {
    createMessages.value = [];
    creating.value = true;

    try {
        await workflowStore.action.create({
            payload: {
                identity: createForm.identity || undefined,
                source: createForm.source,
                onMessage(message: string) {
                    createMessages.value.push(message);
                },
                onError(error: string) {
                    createMessages.value.push(`Error: ${error}`);
                },
            },
        });

        creating.value = false;
        closeCreateDrawer();
    } catch (error) {
        creating.value = false;
        dangerToast("Failed to create workflow", error as Error);
    }
}

async function startAction({ identity }: Pick<DeepReadonly<Workflow>, "identity">) {
    starting.value = identity;

    try {
        await workflowStore.action.start({ payload: { identity } });
    } catch (error) {
        starting.value = null;
        return dangerToast(`Failed to start '${identity}'`, error as Error);
    }

    starting.value = null;
    moreOptionsKey.value++;
}

async function stopAction({ identity }: Pick<DeepReadonly<Workflow>, "identity">) {
    stopping.value = identity;

    try {
        await workflowStore.action.stop({ payload: { identity } });
    } catch (error) {
        stopping.value = null;
        return dangerToast(`Failed to stop '${identity}'`, error as Error);
    }

    stopping.value = null;
    moreOptionsKey.value++;
}

async function removeAction({ identity }: Pick<DeepReadonly<Workflow>, "identity">) {
    removing.value = identity;

    try {
        await workflowStore.action.remove({ payload: { identity } });
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
        await workflowStore.action.removeBatch({ payload: { identities: selectedIdentities.value } });
    } catch (error) {
        dangerToast("Failed to remove batch", error as Error);
    }

    removingBatch.value = false;
}

async function pruneAction() {
    pruning.value = true;

    try {
        await workflowStore.action.prune();
    } catch (error) {
        dangerToast("Failed to prune workflows", error as Error);
    }

    pruning.value = false;
}

useHead({
    title: "Workflows",
});

onMounted(() => {
    load();
});

onBeforeUnmount(() => {
    resetWorkflows();
});
</script>
