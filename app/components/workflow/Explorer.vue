<template>
    <ExplorerSection
        title="Workflows"
        empty-label="No workflows"
        :expanded="props.expanded"
        :loading="loading"
        :empty="!workflows.length"
        @toggle="toggle"
    >
        <template #actions>
            <UiButton
                icon="i-mingcute:add-circle-fill"
                size="xs"
                variant="link"
                color="neutral"
                class="pr-0!"
                :loading="creating"
                :ui="{
                    leadingIcon: 'size-3.5',
                }"
                @click="fileDialog.open()"
                square
            />
        </template>
        <template #empty>
            <ExplorerEmpty
                icon="i-hugeicons:git-branch"
                description="Pipelines imported or run here"
                :title="loading ? 'Loading workflows' : 'No workflows yet'"
                :loading="loading"
            />
        </template>
        <template v-for="workflow in workflows" :key="workflow.identity">
            <WorkflowTree :workflow="workflow" @open="onOpen" />
        </template>
    </ExplorerSection>
</template>

<script lang="ts" setup>
const props = defineProps({
    expanded: {
        type: Boolean,
        default: true,
    },
});

const emit = defineEmits({
    open: null,
    toggle: null,
});

const { data: workflows } = useStoreView(workflowStore, "list");

const fileDialog = useFileDialog({
    reset: true,
    multiple: false,
    accept: ".yaml,.yml,application/x-yaml,text/yaml",
});

const { execute: executeGet, loading } = useStoreAction(workflowStore, "get", {
    isolated: true,
});

const { execute: executeCreate, loading: creating } = useStoreAction(workflowStore, "create", {
    isolated: true,
});

async function load() {
    try {
        await executeGet();
    } catch (error) {
        return dangerToast("Failed to load workflows", error as Error);
    }
}

function toggle() {
    emit("toggle");
}

function onOpen(payload: { workflow: Workflow; view: string; step?: number }) {
    emit("open", payload);
}

async function createFromFile(file: File) {
    try {
        const source = await file.text();

        await executeCreate({
            payload: { source },
        });
    } catch (error) {
        dangerToast("Failed to create workflow", error as Error);
    }
}

fileDialog.onChange((files) => {
    const file = files?.[0];
    if (file) {
        createFromFile(file);
    }
});

onMounted(() => {
    load();
});
</script>
