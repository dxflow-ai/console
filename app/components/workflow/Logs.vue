<template>
    <div class="font-mono text-xs">
        <template v-if="logs.length">
            <template v-for="(log, index) in logs" :key="index">
                <span class="block whitespace-pre-wrap">{{ log.output }}</span>
            </template>
        </template>
        <template v-else>
            <span class="text-dimmed">No active logs</span>
        </template>
    </div>
</template>

<script lang="ts" setup>
const props = defineProps({
    workflow: {
        type: Object as PropType<Workflow>,
        required: true,
    },
});

const { lines: logs, start: startLogs, stop: stopLogs } = useWorkflowLogs();

onMounted(() => {
    startLogs(props.workflow.identity);
});

onUnmounted(() => {
    stopLogs();
});
</script>
