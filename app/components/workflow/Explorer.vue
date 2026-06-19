<template>
    <ExplorerSection
        title="Workflows"
        :expanded="props.expanded"
        :empty="!workflows.length"
        :menu="menu"
        @toggle="toggle"
    >
        <template #actions>
            <UiButton
                icon="i-mingcute:refresh-2-line"
                size="xs"
                variant="link"
                color="neutral"
                class="pr-0!"
                :loading="loading || creating"
                :ui="{
                    leadingIcon: 'size-3.5',
                }"
                @click="load()"
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
import type { ContextMenuItem } from "@nuxt/ui";

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

const { execute: executeGet, loading } = useStoreAction(workflowStore, "get", {
    isolated: true,
});

const { createFromFile, creating } = useWorkflowActions();

const fileDialog = useFileDialog({
    reset: true,
    multiple: false,
    accept: ".yaml,.yml,application/x-yaml,text/yaml",
});

const menu = computed<ContextMenuItem[]>(() => {
    return [
        {
            label: "New workflow",
            onSelect() {
                fileDialog.open();
            },
        },
    ];
});

function toggle() {
    emit("toggle");
}

function onOpen(payload: { workflow: Workflow; view: string; step?: number }) {
    emit("open", payload);
}

async function load() {
    try {
        await executeGet();
    } catch (error) {
        return dangerToast("Failed to load workflows", error as Error);
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
