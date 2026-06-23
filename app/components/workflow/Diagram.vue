<template>
    <div class="flex h-full flex-col">
        <template v-if="loading || !phases.length">
            <div class="flex-1">
                <Empty
                    icon="i-hugeicons:git-branch"
                    description="Workflow steps appear here"
                    :title="loading ? 'Loading diagram' : 'No steps'"
                    :loading="loading"
                />
            </div>
        </template>
        <template v-else>
            <div
                ref="viewport-element"
                class="diagram-canvas relative flex-1 overflow-hidden -m-4 transition-opacity"
                :class="[
                    panning ? 'cursor-grabbing' : 'cursor-grab',
                    {
                        'opacity-0': !centered,
                    },
                ]"
                @pointerdown="onPointerDown"
                @pointermove="onPointerMove"
                @pointerup="onPointerUp"
                @pointerleave="onPointerUp"
                @wheel="onWheel"
            >
                <div ref="content-element" class="flex w-max items-center p-4" :style="style">
                    <template v-for="(phase, phaseIndex) in phases" :key="phase.phase">
                        <div
                            class="flex shrink-0 flex-col gap-2"
                            :class="{
                                'ml-16': phaseIndex > 0,
                            }"
                        >
                            <span class="text-xs font-medium text-dimmed">Phase {{ phase.phase }}</span>
                            <template v-for="step in phase.steps" :key="step.identity">
                                <div class="relative rounded-lg bg-default">
                                    <UiAlert
                                        class="min-w-72"
                                        variant="soft"
                                        orientation="horizontal"
                                        :color="stepColor(step)"
                                        :ui="{
                                            title: 'flex items-center gap-2',
                                        }"
                                    >
                                        <template #title>
                                            <UiIcon
                                                :name="stepIcon(step)"
                                                :class="{
                                                    'animate-spin': step.status === WorkflowStepStatus.RUNNING,
                                                }"
                                            />
                                            <span>{{ title(step.name) }}</span>
                                        </template>
                                        <template #description>
                                            <span>{{ title(step.status) }}</span>
                                            <template v-if="step.pid">
                                                <span> - pid {{ step.pid }}</span>
                                            </template>
                                            <template v-if="step.exit_code">
                                                <span> - exit {{ step.exit_code }}</span>
                                            </template>
                                        </template>
                                        <template #actions>
                                            <template v-if="canStart && step.index === firstStepIndex">
                                                <UiButton
                                                    size="md"
                                                    color="neutral"
                                                    variant="link"
                                                    icon="i-mingcute:play-circle-fill"
                                                    :loading="actions.isBusyWith(current.identity, 'start')"
                                                    :disabled="busy"
                                                    @click="actions.start(current)"
                                                    square
                                                />
                                            </template>
                                            <template v-if="canStop && step.index === latestRunningIndex">
                                                <UiButton
                                                    size="md"
                                                    color="neutral"
                                                    variant="link"
                                                    icon="i-mingcute:pause-circle-fill"
                                                    :loading="actions.isBusyWith(current.identity, 'stop')"
                                                    :disabled="busy"
                                                    @click="actions.stop(current)"
                                                />
                                            </template>
                                        </template>
                                    </UiAlert>
                                </div>
                            </template>
                        </div>
                    </template>
                </div>
            </div>
        </template>
    </div>
</template>

<script lang="ts" setup>
import { title } from "radash";

import type { AlertProps } from "@nuxt/ui";

const props = defineProps({
    workflow: {
        type: Object as PropType<Workflow>,
        required: true,
    },
});

const actions = useWorkflowActions();

const viewport = useTemplateRef<HTMLElement>("viewport-element");
const content = useTemplateRef<HTMLElement>("content-element");

const { data: list } = useStoreView(workflowStore, "list");

const { data: steps, loading } = useWorkflowSteps(props.workflow.identity);

const { panning, style, onWheel, onPointerDown, onPointerMove, onPointerUp, center } = useViewport({
    min: 0.5,
    max: 1,
    step: 0.05,
});

const centered = ref(false);

const current = computed(() => {
    const match = list.value.find((item) => {
        return item.identity === props.workflow.identity;
    });

    return match ?? props.workflow;
});

const busy = computed(() => {
    return actions.isBusy(props.workflow.identity);
});

const canStart = computed(() => {
    return canStartWorkflow(current.value.status);
});

const canStop = computed(() => {
    return canStopWorkflow(current.value.status);
});

const firstStepIndex = computed(() => {
    const indexes = steps.value.map((step) => {
        return step.index;
    });

    return indexes.length ? Math.min(...indexes) : null;
});

const latestRunningIndex = computed(() => {
    const running = steps.value.filter((step) => {
        return step.status === WorkflowStepStatus.RUNNING;
    });

    if (!running.length) {
        return null;
    }

    return Math.max(
        ...running.map((step) => {
            return step.index;
        }),
    );
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

watchDebounced(
    [loading, phases],
    () => {
        if (centered.value || loading.value || !phases.value.length) {
            return;
        }

        center(viewport.value, content.value);

        centered.value = true;
    },
    {
        immediate: true,
        debounce: 250,
    },
);

function stepColor(step: WorkflowStep): AlertProps["color"] {
    if (step.status === WorkflowStepStatus.RUNNING) {
        return "blue";
    }

    if (step.status === WorkflowStepStatus.EXITED) {
        return step.exit_code ? "yellow" : "green";
    }

    return "neutral";
}

function stepIcon(step: WorkflowStep) {
    if (step.status === WorkflowStepStatus.RUNNING) {
        return "i-mingcute:loading-3-fill";
    }

    if (step.status === WorkflowStepStatus.EXITED) {
        return step.exit_code ? "i-mingcute:close-circle-line" : "i-mingcute:check-circle-line";
    }

    return "i-mingcute:time-line";
}
</script>

<style scoped>
.diagram-canvas {
    background-image: radial-gradient(rgb(128 128 128 / 0.18) 1px, transparent 1px);
    background-size: 16px 16px;
}
</style>
