<template>
    <ContextMenu :items="menu">
        <div class="min-h-full">
            <template v-if="logs.length">
                <div class="font-mono text-sm/[1.1] text-default antialiased tab-4 select-text">
                    <template v-for="(log, index) in logs" :key="index">
                        <span class="block whitespace-pre-wrap break-all">{{ log.output }}</span>
                    </template>
                </div>
            </template>
            <template v-else>
                <Empty
                    icon="i-hugeicons:git-branch"
                    description="Step output appears here"
                    :title="loading ? 'Loading logs' : 'No logs yet'"
                    :loading="loading"
                />
            </template>
        </div>
    </ContextMenu>
</template>

<script lang="ts" setup>
import type { ContextMenuItem } from "@nuxt/ui";

const props = defineProps({
    workflow: {
        type: Object as PropType<Workflow>,
        required: true,
    },
});

const { lines: logs, loading, start: startLogs, stop: stopLogs, clear: clearLogs } = useWorkflowLogs();

const menu = computed(() => {
    const output: ContextMenuItem[] = [
        {
            label: "Clear",
            disabled: !logs.value.length,
            onSelect() {
                clearLogs();
            },
        },
    ];

    return output;
});

onMounted(() => {
    startLogs(props.workflow.identity);
});

onUnmounted(() => {
    stopLogs();
});
</script>
