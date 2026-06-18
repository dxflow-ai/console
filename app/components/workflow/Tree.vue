<template>
    <div class="px-1">
        <button
            type="button"
            class="flex w-full items-center gap-1.5 rounded-sm py-1.5 pr-2 pl-[--spacing(var(--tree-indent))] text-xs hover:bg-elevated"
            :style="{
                '--tree-indent': 2,
            }"
            @click="toggle()"
        >
            <StatusDot :status="props.workflow.status" />
            <span class="truncate">{{ props.workflow.name }}</span>
        </button>
        <template v-if="expanded">
            <div class="relative">
                <div
                    class="absolute w-px h-full left-[--spacing(var(--tree-depth))] z-10"
                    :style="{
                        '--tree-depth': 3,
                    }"
                >
                    <div class="absolute w-px h-full bg-elevated left-px" />
                </div>
                <button
                    type="button"
                    class="flex w-full items-center gap-1.5 rounded-sm py-1.5 pr-2 pl-[--spacing(var(--tree-indent))] text-xs hover:bg-elevated"
                    :style="{
                        '--tree-indent': 5,
                    }"
                    @click="open('diagram')"
                >
                    <UiIcon name="i-mingcute:git-branch-line" class="size-3 shrink-0 text-muted" />
                    <span class="truncate">Diagram</span>
                </button>
                <button
                    type="button"
                    class="flex w-full items-center gap-1.5 rounded-sm py-1.5 pr-2 pl-[--spacing(var(--tree-indent))] text-xs hover:bg-elevated"
                    :style="{
                        '--tree-indent': 5,
                    }"
                    @click="toggleSteps()"
                >
                    <UiIcon
                        :name="
                            loadingSteps
                                ? 'i-mingcute:loading-3-fill'
                                : stepsExpanded
                                  ? 'i-mingcute:down-small-fill'
                                  : 'i-mingcute:right-small-fill'
                        "
                        :class="['size-3 shrink-0 text-muted', { 'animate-spin': loadingSteps }]"
                    />
                    <span class="truncate">steps</span>
                </button>
                <template v-if="stepsExpanded">
                    <div class="relative">
                        <div
                            class="absolute w-px h-full left-[--spacing(var(--tree-depth))] z-10"
                            :style="{
                                '--tree-depth': 6,
                            }"
                        >
                            <div class="absolute w-px h-full bg-elevated left-px" />
                        </div>
                        <template v-for="step in steps" :key="step.identity">
                            <button
                                type="button"
                                class="flex w-full items-center gap-1.5 rounded-sm py-1.5 pr-2 pl-[--spacing(var(--tree-indent))] text-xs hover:bg-elevated"
                                :style="{
                                    '--tree-indent': 8,
                                }"
                                @click="open('step', step.index)"
                            >
                                <StatusDot :status="step.status" />
                                <span class="truncate">{{ step.name }}</span>
                            </button>
                        </template>
                    </div>
                </template>
                <button
                    type="button"
                    class="flex w-full items-center gap-1.5 rounded-sm py-1.5 pr-2 pl-[--spacing(var(--tree-indent))] text-xs hover:bg-elevated"
                    :style="{
                        '--tree-indent': 5,
                    }"
                    @click="open('logs')"
                >
                    <UiIcon name="i-mingcute:terminal-line" class="size-3 shrink-0 text-muted" />
                    <span class="truncate">logs</span>
                </button>
                <button
                    type="button"
                    class="flex w-full items-center gap-1.5 rounded-sm py-1.5 pr-2 pl-[--spacing(var(--tree-indent))] text-xs hover:bg-elevated"
                    :style="{
                        '--tree-indent': 5,
                    }"
                    @click="open('events')"
                >
                    <UiIcon name="i-mingcute:list-check-line" class="size-3 shrink-0 text-muted" />
                    <span class="truncate">events</span>
                </button>
            </div>
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

const emit = defineEmits({
    open: null,
});

const { data: stepsRecord } = useStoreView(workflowStore, "steps");

const { execute: executeGetSteps, loading: loadingSteps } = useStoreAction(workflowStore, "getStepsById", {
    isolated: true,
});

const expanded = ref(false);
const stepsExpanded = ref(false);

const steps = computed<WorkflowStep[]>(() => {
    return stepsRecord.value[props.workflow.identity] ?? [];
});

function open(view: string, step?: number) {
    emit("open", { workflow: props.workflow, view, step });
}

async function toggle() {
    expanded.value = !expanded.value;
}

async function toggleSteps() {
    if (stepsExpanded.value) {
        stepsExpanded.value = false;
        return;
    }

    if (!stepsRecord.value[props.workflow.identity]) {
        try {
            await executeGetSteps({ payload: { identity: props.workflow.identity } });
        } catch (error) {
            return dangerToast("Failed to load steps", error as Error);
        }
    }

    stepsExpanded.value = true;
}
</script>
