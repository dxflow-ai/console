<template>
    <div class="flex min-h-0 flex-1 flex-col">
        <div class="flex h-9 shrink-0 items-center gap-2 border-b border-default px-3 text-xs text-muted">
            <span class="font-medium text-default">{{ props.workflow.name }}</span>
            <UiSeparator orientation="vertical" class="h-3" />
            <span class="capitalize">{{ props.view }}</span>
        </div>
        <div class="min-h-0 flex-1 overflow-auto p-4">
            <template v-if="loading">
                <div class="flex h-full items-center justify-center text-xs text-dimmed">
                    <UiIcon name="i-mingcute:loading-3-fill" class="size-4 animate-spin" />
                </div>
            </template>
            <template v-else-if="props.view === 'diagram'">
                <div class="flex items-start gap-4">
                    <template v-for="phase in phases" :key="phase.phase">
                        <div class="flex flex-col gap-2">
                            <span class="text-xs text-dimmed">phase {{ phase.phase }}</span>
                            <template v-for="step in phase.steps" :key="step.identity">
                                <div class="flex items-center gap-2 rounded-md border border-default px-3 py-2 text-sm">
                                    <StatusDot :status="step.status" />
                                    <span class="truncate">{{ step.name }}</span>
                                </div>
                            </template>
                        </div>
                    </template>
                </div>
            </template>
            <template v-else-if="props.view === 'step'">
                <template v-if="activeStep">
                    <div class="flex flex-col gap-1.5 text-sm">
                        <div class="flex items-center gap-2">
                            <StatusDot :status="activeStep.status" />
                            <span class="font-medium">{{ activeStep.name }}</span>
                        </div>
                        <span class="text-xs text-muted">status: {{ activeStep.status }}</span>
                        <span class="text-xs text-muted"
                            >phase: {{ activeStep.phase }} · index: {{ activeStep.index }}</span
                        >
                        <span class="text-xs text-muted"
                            >pid: {{ activeStep.pid || "—" }} · exit: {{ activeStep.exit_code }}</span
                        >
                    </div>
                </template>
            </template>
            <template v-else-if="props.view === 'events'">
                <div class="flex flex-col gap-1.5">
                    <template v-for="(event, index) in events" :key="index">
                        <div class="flex items-baseline gap-2 text-sm">
                            <DateLabel
                                class="shrink-0 text-xs text-dimmed"
                                month="short"
                                day="numeric"
                                hour="numeric"
                                minute="numeric"
                                second="numeric"
                                :timestamp="event.time"
                            />
                            <span>{{ event.message }}</span>
                        </div>
                    </template>
                    <template v-if="!events.length">
                        <span class="text-xs text-dimmed">No events</span>
                    </template>
                </div>
            </template>
            <template v-else-if="props.view === 'logs'">
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
            <template v-else>
                <div class="flex flex-col gap-1.5">
                    <template v-for="step in steps" :key="step.identity">
                        <div class="flex items-center gap-2 text-sm">
                            <StatusDot :status="step.status" />
                            <span class="truncate">{{ step.name }}</span>
                            <span class="text-xs text-dimmed">{{ step.status }}</span>
                        </div>
                    </template>
                </div>
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

const { data: steps } = useStoreView(workflowStore, "steps", (record) => {
    return record[props.workflow.identity] ?? [];
});

const { data: events } = useStoreView(workflowStore, "events", (record) => {
    return record[props.workflow.identity] ?? [];
});

const { execute: executeGetSteps, loading: loadingSteps } = useStoreAction(workflowStore, "getStepsById", {
    isolated: true,
});

const { execute: executeGetEvents, loading: loadingEvents } = useStoreAction(workflowStore, "getEventsById", {
    isolated: true,
});

const { lines: logs, start: startLogs, stop: stopLogs } = useWorkflow().logs();

const loading = computed(() => {
    return loadingSteps.value || loadingEvents.value;
});

const phases = computed(() => {
    const grouped = new Map<number, WorkflowStep[]>();
    for (const step of steps.value) {
        const bucket = grouped.get(step.phase) ?? [];

        bucket.push(step);
        grouped.set(step.phase, bucket);
    }

    const sorted = Array.from(grouped.entries())
        .sort((first, second) => {
            return first[0] - second[0];
        })
        .map(([phase, value]) => {
            return {
                phase,
                steps: value,
            };
        });

    return sorted;
});

const activeStep = computed<WorkflowStep | null>(() => {
    const active = steps.value.find((item) => {
        return item.index === props.step;
    });

    return active ?? null;
});

async function load() {
    if (props.view === "logs") {
        startLogs(props.workflow.identity);

        return;
    }

    try {
        if (props.view === "events") {
            await executeGetEvents({
                payload: {
                    identity: props.workflow.identity,
                },
            });
        } else {
            await executeGetSteps({
                payload: {
                    identity: props.workflow.identity,
                },
            });
        }
    } catch (error) {
        return dangerToast("Failed to load workflow", error as Error);
    }
}

onMounted(() => {
    load();
});

onUnmounted(() => {
    if (props.view === "logs") {
        stopLogs();
    }
});
</script>
