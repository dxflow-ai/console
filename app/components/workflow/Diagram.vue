<template>
    <div class="relative min-h-full">
        <div
            class="flex items-start gap-4"
            :class="{
                'opacity-0': loading,
            }"
        >
            <template v-for="phase in phases" :key="phase.phase">
                <div class="flex flex-col gap-2">
                    <span class="text-xs text-dimmed">phase {{ phase.phase }}</span>
                    <template v-for="step in phase.steps" :key="step.identity">
                        <div class="flex items-center gap-2 rounded-md border border-default px-3 py-2 text-sm">
                            <WorkflowStatus :status="step.status" />
                            <span class="truncate">{{ step.name }}</span>
                        </div>
                    </template>
                </div>
            </template>
        </div>
        <Loading :active="loading" />
    </div>
</template>

<script lang="ts" setup>
const props = defineProps({
    workflow: {
        type: Object as PropType<Workflow>,
        required: true,
    },
});

const { data: steps, loading } = useWorkflowSteps(props.workflow.identity);

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
</script>
