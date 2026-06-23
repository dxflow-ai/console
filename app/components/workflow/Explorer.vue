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
                :loading="loading || creating || pruning"
                :ui="{
                    leadingIcon: 'size-3.5',
                }"
                @click="load()"
                square
            />
        </template>
        <template #empty>
            <Empty
                icon="i-hugeicons:git-branch"
                description="Pipelines imported or run here"
                :title="loading ? 'Loading workflows' : 'No workflows yet'"
                :loading="loading"
            >
                <template #action>
                    <UiButton
                        class="underline"
                        size="xs"
                        variant="link"
                        color="neutral"
                        label="New workflow"
                        :loading="creating"
                        :disabled="loading"
                        @click="fileDialog.open()"
                    />
                </template>
            </Empty>
        </template>
        <template v-for="workflow in workflows" :key="workflow.identity">
            <WorkflowNode :workflow="workflow" @open="onOpen" />
        </template>
    </ExplorerSection>
</template>

<script lang="ts" setup>
import { sleep } from "radash";

import type { ContextMenuItem } from "@nuxt/ui";

const props = defineProps({
    expanded: {
        type: Boolean,
        default: true,
    },
});

const emit = defineEmits({
    open(payload: { workflow: Workflow }) {
        return true;
    },
    toggle() {
        return true;
    },
});

const { data: workflows } = useStoreView(workflowStore, "list");

const { execute: executeGet, loading } = useStoreAction(workflowStore, "get", {
    isolated: true,
});

const { create, creating, pruning } = useWorkflowActions();

const fileDialog = useWorkflowFileDialog();

const menu = computed(() => {
    const output: ContextMenuItem[] = [
        {
            label: "New workflow",
            onSelect() {
                fileDialog.open();
            },
        },
    ];

    return output;
});

function toggle() {
    emit("toggle");
}

function onOpen(payload: { workflow: Workflow }) {
    emit("open", payload);
}

async function load(delay?: number) {
    if (delay) {
        await sleep(delay);
    }

    try {
        await executeGet();
    } catch (error) {
        return dangerToast("Failed to load workflows", error as Error);
    }
}

fileDialog.onChange((files) => {
    const file = files?.[0];
    if (file) {
        create(file);
    }
});

onMounted(() => {
    load(500);
});
</script>
