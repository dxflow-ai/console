<template>
    <div class="relative min-h-full">
        <template v-if="activeStep">
            <div
                class="flex flex-col gap-1.5 text-sm"
                :class="{
                    'opacity-0': loading,
                }"
            >
                <div class="flex items-center gap-2">
                    <WorkflowStatus :status="activeStep.status" />
                    <span class="font-medium">{{ activeStep.name }}</span>
                </div>
                <span class="text-xs text-muted">
                    <span>status: {{ activeStep.status }}</span>
                </span>
                <span class="text-xs text-muted">
                    <span>phase: {{ activeStep.phase }} · index: {{ activeStep.index }}</span>
                </span>
                <span class="text-xs text-muted">
                    <span>pid: {{ activeStep.pid || "—" }} · exit: {{ activeStep.exit_code }}</span>
                </span>
            </div>
        </template>
        <Loading :active="loading" />
    </div>
</template>

<script lang="ts" setup>
const props = defineProps({
    workflow: {
        type: Object as PropType<Workflow>,
        required: true,
    },
    step: {
        type: Number,
        default: undefined,
    },
});

const { data: steps, loading } = useWorkflowSteps(props.workflow.identity);

const activeStep = computed<WorkflowStep | null>(() => {
    const active = steps.value.find((item) => {
        return item.index === props.step;
    });

    return active ?? null;
});
</script>
