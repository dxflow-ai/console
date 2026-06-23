<template>
    <div class="flex h-full flex-col">
        <div class="min-h-0 flex-1 overflow-auto p-4">
            <template v-if="props.view === 'diagram'">
                <WorkflowDiagram :workflow="props.workflow" />
            </template>
            <template v-else-if="props.view === 'logs'">
                <WorkflowLogs :workflow="props.workflow" />
            </template>
        </div>
    </div>
</template>

<script lang="ts" setup>
const props = defineProps({
    workflow: {
        type: Object as PropType<Workflow>,
        required: true,
    },
    view: {
        type: String,
        required: true,
    },
});
</script>
