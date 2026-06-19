<template>
    <div class="flex min-h-0 flex-1 flex-col">
        <div class="flex h-9 shrink-0 items-center gap-2 border-b border-default px-3 text-xs text-muted">
            <span class="font-medium text-default">{{ props.workflow.name }}</span>
            <UiSeparator orientation="vertical" class="h-3" />
            <span class="capitalize">{{ props.view }}</span>
        </div>
        <div class="min-h-0 flex-1 overflow-auto p-4">
            <template v-if="props.view === 'diagram'">
                <WorkflowDiagram :workflow="props.workflow" />
            </template>
            <template v-else-if="props.view === 'step'">
                <WorkflowStep :workflow="props.workflow" :step="props.step" />
            </template>
            <template v-else-if="props.view === 'events'">
                <WorkflowEvents :workflow="props.workflow" />
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
    step: {
        type: Number,
        default: undefined,
    },
});
</script>
