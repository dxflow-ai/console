<template>
    <HeaderLine>
        <template #tags>
            <UiBadge size="sm" variant="outline" color="teal">
                <span>Workflows</span>
            </UiBadge>
        </template>
        <template #title>
            <span class="font-bold text-2xl text-nowrap">Workflows</span>
        </template>
        <template #actions>
            <UiTooltip
                text="Prune Workflows"
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
                text="Create Workflow"
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
                    @click="openCreateDrawer()"
                    square
                />
            </UiTooltip>
        </template>
        <template #options>
            <StatBadge label="Total" :value="orderedWorkflows.length" />
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
            :data="orderedWorkflows"
            :loading="loading"
            :ui="{
                empty: 'hidden',
            }"
            sticky
        >
            <template #identity-header>
                <TableColumnHeader icon="i-mingcute:git-branch-line" label="Identity" />
            </template>
            <template #identity-cell="{ row }">
                <div class="flex items-center gap-2 select-none">
                    <TableRowSelect :selected="row.getIsSelected()" @toggle="row.toggleSelected()" />
                    <span class="font-mono text-sm">{{ row.original.identity }}</span>
                </div>
            </template>
            <template #name-header>
                <TableColumnHeader icon="i-mingcute:file-line" label="Name" />
            </template>
            <template #name-cell="{ row }">
                <span class="text-sm">{{ row.original.name }}</span>
            </template>
            <template #status-header>
                <TableColumnHeader icon="i-mingcute:tag-line" label="Status" />
            </template>
            <template #status-cell="{ row }">
                <WorkflowStatusBadge :status="row.original.status" />
            </template>
            <template #tags-header>
                <TableColumnHeader icon="i-mingcute:tag-2-line" label="Tags" />
            </template>
            <template #tags-cell="{ row }">
                <div class="flex items-center gap-1">
                    <template v-for="tag in row.original.tags.slice(0, 3)" :key="tag">
                        <UiBadge size="xs" variant="soft" color="neutral">
                            <span>{{ tag }}</span>
                        </UiBadge>
                    </template>
                    <template v-if="row.original.tags.length > 3">
                        <UiBadge size="xs" variant="soft" color="neutral">
                            +{{ row.original.tags.length - 3 }}
                        </UiBadge>
                    </template>
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
                        leading-icon="i-mingcute:eye-line"
                        size="xs"
                        variant="soft"
                        color="primary"
                        @click="openDetailDrawer(row.original)"
                    />
                    <MoreOptions :key="moreOptionsKey" :items="getActions(row.original)" />
                </div>
            </template>
        </UiTable>
        <template v-if="empty">
            <EmptyPlaceholder title="No Workflows Available" description="Create a new workflow" />
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
                <UiIcon name="i-mingcute:git-branch-line" class="size-6 text-primary" />
                <span class="text-xl font-bold">Create Workflow</span>
            </div>
            <div class="flex items-center gap-2">
                <UiButton
                    icon="i-mingcute:close-line"
                    size="xs"
                    variant="ghost"
                    color="neutral"
                    @click="closeCreateDrawer()"
                    square
                />
            </div>
        </template>
        <template #body>
            <div class="flex flex-col gap-4 p-4">
                <UiFormField label="Identity" hint="Optional unique identifier">
                    <UiInput
                        v-model="createForm.identity"
                        placeholder="auto-generated if empty"
                        :ui="{
                            base: 'font-mono',
                        }"
                    />
                </UiFormField>
                <UiFormField label="Workflow Definition" hint="dxflow YAML workflow definition" required>
                    <UiTextarea
                        v-model="createForm.source"
                        placeholder="name: my-workflow&#10;tags:&#10;  - example&#10;&#10;steps:&#10;  - name: step-1&#10;    platform: docker&#10;    mode: sequential&#10;    image: alpine:latest&#10;    command: [echo, hello]"
                        :rows="12"
                        :ui="{
                            base: 'font-mono text-xs',
                        }"
                    />
                </UiFormField>
                <div class="flex items-center justify-end gap-2">
                    <UiButton
                        size="sm"
                        variant="outline"
                        color="neutral"
                        :disabled="creating"
                        @click="closeCreateDrawer()"
                    >
                        <span>Cancel</span>
                    </UiButton>
                    <UiButton
                        size="sm"
                        variant="solid"
                        color="primary"
                        :loading="creating"
                        :disabled="creating || !createForm.source"
                        @click="createAction()"
                    >
                        <span>Create</span>
                    </UiButton>
                </div>
                <template v-if="createMessages.length">
                    <UiCard
                        :ui="{
                            root: 'ring ring-default',
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
                <UiIcon name="i-mingcute:git-branch-line" class="size-6 text-primary" />
                <div class="flex items-center gap-4">
                    <span class="text-xl font-bold">{{ displayed?.identity }}</span>
                    <template v-if="displayed">
                        <WorkflowStatusBadge :status="displayed.status" />
                    </template>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <UiButton
                    icon="i-mingcute:close-line"
                    size="xs"
                    variant="ghost"
                    color="neutral"
                    @click="closeDetailDrawer()"
                    square
                />
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
                                class="text-sm"
                                month="short"
                                day="numeric"
                                hour="numeric"
                                minute="numeric"
                                :timestamp="displayed.created_at"
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
                                icon="i-mingcute:play-line"
                                label="Start"
                                size="sm"
                                variant="soft"
                                color="green"
                                :loading="starting === displayed.identity"
                                @click="startAction(displayed)"
                            />
                        </template>
                        <template v-if="canStop">
                            <UiButton
                                icon="i-mingcute:stop-line"
                                label="Stop"
                                size="sm"
                                variant="soft"
                                color="amber"
                                :loading="stopping === displayed.identity"
                                @click="stopAction(displayed)"
                            />
                        </template>
                    </div>
                    <!-- Steps -->
                    <UiCard
                        :ui="{
                            root: 'ring ring-default',
                            header: 'p-3 pb-0',
                            body: 'p-3',
                        }"
                    >
                        <template #header>
                            <div class="flex items-center justify-between">
                                <span class="text-sm font-bold">Steps</span>
                                <UiButton
                                    icon="i-mingcute:refresh-2-line"
                                    size="xs"
                                    variant="ghost"
                                    color="neutral"
                                    :loading="loadingSteps"
                                    @click="loadSteps(displayed.identity)"
                                    square
                                />
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
                                        <UiBadge size="xs" variant="subtle" :color="getStepStatusColor(step.status)">
                                            <span>{{ step.status }}</span>
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
                            root: 'ring ring-default',
                            header: 'p-3 pb-0',
                            body: 'p-3',
                        }"
                    >
                        <template #header>
                            <div class="flex items-center justify-between">
                                <span class="text-sm font-bold">Events</span>
                                <UiButton
                                    icon="i-mingcute:refresh-2-line"
                                    size="xs"
                                    variant="ghost"
                                    color="neutral"
                                    :loading="loadingEvents"
                                    @click="loadEvents(displayed.identity)"
                                    square
                                />
                            </div>
                        </template>
                        <div class="flex flex-col gap-2 max-h-48 overflow-y-auto">
                            <template v-if="displayedEvents.length">
                                <template v-for="(event, index) in displayedEvents" :key="index">
                                    <div class="flex items-start gap-2 p-2 rounded-md bg-elevated/50">
                                        <DateLabel
                                            class="text-xs text-dimmed shrink-0"
                                            hour="numeric"
                                            minute="numeric"
                                            second="numeric"
                                            :timestamp="event.time"
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
import { sleep } from "radash";

import type { DeepReadonly } from "vue";
import type { TableColumn } from "@nuxt/ui";

definePageMeta({
    name: "workflow-list",
    layout: "console",
    middleware: "guard",
});

const { data: orderedWorkflows } = useStoreView(workflowStore, "list");
const { execute: loadWorkflows, loading } = useStoreAction(workflowStore, "get");
const { execute: resetWorkflows } = useStoreAction(workflowStore, "reset");

const { execute: executeLoadSteps, loading: loadingSteps } = useStoreAction(workflowStore, "getStepsById", {
    isolated: true,
});

const { execute: executeLoadEvents, loading: loadingEvents } = useStoreAction(workflowStore, "getEventsById", {
    isolated: true,
});

const { data: stepsRecord } = useStoreView(workflowStore, "steps");
const { data: eventsRecord } = useStoreView(workflowStore, "events");

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

    sleep(250).then(() => {
        createDrawer.value = true;
    });
}

function closeCreateDrawer() {
    createDrawer.value = false;
}

function openDetailDrawer(workflow: DeepReadonly<Workflow>) {
    displayed.value = workflow;

    sleep(250).then(() => {
        detailDrawer.value = true;
        loadSteps(workflow.identity);
        loadEvents(workflow.identity);
    });
}

function closeDetailDrawer() {
    detailDrawer.value = false;

    sleep(250).then(() => {
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
        await workflowStore.action.startById({ payload: { identity } });
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
        await workflowStore.action.stopById({ payload: { identity } });
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
        await workflowStore.action.removeById({ payload: { identity } });
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
