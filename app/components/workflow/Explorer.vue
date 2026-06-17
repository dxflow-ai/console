<template>
    <div class="flex min-h-0 flex-col">
        <div class="flex shrink-0 items-center justify-between px-3 py-2">
            <span class="text-xs font-semibold text-muted uppercase">Workflows</span>
            <div class="flex items-center gap-0.5">
                <UiTooltip text="Create Workflow" :delay-duration="500" :content="{ side: 'top' }">
                    <UiButton
                        icon="i-mingcute:add-line"
                        size="xs"
                        variant="ghost"
                        color="neutral"
                        @click="openCreate()"
                        square
                    />
                </UiTooltip>
                <UiTooltip text="Prune Workflows" :delay-duration="500" :content="{ side: 'top' }">
                    <UiButton
                        icon="i-mingcute:broom-line"
                        size="xs"
                        variant="ghost"
                        color="neutral"
                        :loading="pruning"
                        @click="confirmPrune.open()"
                        square
                    />
                </UiTooltip>
            </div>
        </div>

        <div class="min-h-0 flex-1 overflow-auto pb-2">
            <template v-if="loading && !workflows.length">
                <div class="px-3 py-2 text-xs text-dimmed">Loading…</div>
            </template>
            <template v-else-if="!workflows.length">
                <div class="px-3 py-2 text-xs text-dimmed">No workflows</div>
            </template>
            <template v-else>
                <template v-for="workflow in workflows" :key="workflow.identity">
                    <WorkflowTreeNode
                        :workflow="workflow"
                        @open="emit('open', $event)"
                        @remove="confirmRemove.open($event)"
                    />
                </template>
            </template>
        </div>

        <UiDrawer
            :open="createDrawer"
            :handle="false"
            :dismissible="false"
            :ui="{
                header: 'flex items-center justify-between',
            }"
        >
            <template #header>
                <div class="flex items-center gap-2">
                    <UiIcon name="i-mingcute:git-branch-line" class="size-6 text-primary" />
                    <span class="text-xl font-bold">Create Workflow</span>
                </div>
                <UiButton
                    icon="i-mingcute:close-line"
                    size="xs"
                    variant="ghost"
                    color="neutral"
                    @click="closeCreate()"
                    square
                />
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
                            @click="closeCreate()"
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
                </div>
            </template>
        </UiDrawer>
    </div>
</template>

<script lang="ts" setup>
const emit = defineEmits({
    open: null,
});

const { data: workflows } = useStoreView(workflowStore, "list");

const confirmRemove = useConfirmToast({
    id: "workflow-remove-confirm",
    icon: "i-mingcute:delete-3-line",
    color: "red",
    title() {
        return "Remove Workflow";
    },
    description(payload: Workflow) {
        return `Are you sure you want to remove '${payload.name}'?`;
    },
    async confirm(payload: Workflow) {
        try {
            await workflowStore.action.removeById({ payload: { identity: payload.identity } });
        } catch (error) {
            dangerToast(`Failed to remove '${payload.name}'`, error as Error);
        }
    },
});

const confirmPrune = useConfirmToast({
    id: "workflow-prune-confirm",
    icon: "i-mingcute:broom-line",
    color: "neutral",
    title() {
        return "Prune Workflows";
    },
    description() {
        return "Are you sure you want to remove all workflows?";
    },
    confirm() {
        pruneAction();
    },
});

const createDrawer = ref(false);

const createForm = reactive({
    identity: "",
    source: "",
});

const loading = ref(false);
const creating = ref(false);
const pruning = ref(false);

async function load() {
    loading.value = true;

    try {
        await workflowStore.action.get();
    } catch (error) {
        loading.value = false;
        return dangerToast("Failed to load workflows", error as Error);
    }

    loading.value = false;
}

function openCreate() {
    createForm.identity = "";
    createForm.source = "";
    createDrawer.value = true;
}

function closeCreate() {
    createDrawer.value = false;
}

async function createAction() {
    creating.value = true;

    try {
        await workflowStore.action.create({
            payload: {
                identity: createForm.identity || undefined,
                source: createForm.source,
            },
        });

        closeCreate();
    } catch (error) {
        dangerToast("Failed to create workflow", error as Error);
    }

    creating.value = false;
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

onMounted(() => {
    load();
});
</script>
