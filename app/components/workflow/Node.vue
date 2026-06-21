<template>
    <div class="px-1">
        <div
            class="flex w-full items-center gap-1.5 rounded-sm py-1.5 pr-2 pl-[--spacing(var(--tree-indent))] text-xs hover:bg-elevated cursor-pointer"
            :style="{
                '--tree-indent': 2,
            }"
            @click="toggle()"
        >
            <WorkflowStatus :status="props.workflow.status" />
            <span class="truncate">{{ props.workflow.name }}</span>
        </div>
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
                <div
                    class="flex w-full items-center gap-1.5 rounded-sm py-1.5 pr-2 pl-[--spacing(var(--tree-indent))] text-xs hover:bg-elevated cursor-pointer"
                    :style="{
                        '--tree-indent': 5,
                    }"
                    @click="open('diagram')"
                >
                    <UiIcon name="i-mingcute:git-branch-line" class="size-3 shrink-0 text-muted" />
                    <span class="truncate">Diagram</span>
                </div>
                <div
                    class="flex w-full items-center gap-1.5 rounded-sm py-1.5 pr-2 pl-[--spacing(var(--tree-indent))] text-xs hover:bg-elevated cursor-pointer"
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
                </div>
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
                            <div
                                class="flex w-full items-center gap-1.5 rounded-sm py-1.5 pr-2 pl-[--spacing(var(--tree-indent))] text-xs hover:bg-elevated cursor-pointer"
                                :style="{
                                    '--tree-indent': 8,
                                }"
                                @click="open('step', step.index)"
                            >
                                <WorkflowStatus :status="step.status" />
                                <span class="truncate">{{ step.name }}</span>
                            </div>
                        </template>
                    </div>
                </template>
                <div
                    class="flex w-full items-center gap-1.5 rounded-sm py-1.5 pr-2 pl-[--spacing(var(--tree-indent))] text-xs hover:bg-elevated cursor-pointer"
                    :style="{
                        '--tree-indent': 5,
                    }"
                    @click="open('logs')"
                >
                    <UiIcon name="i-mingcute:terminal-line" class="size-3 shrink-0 text-muted" />
                    <span class="truncate">logs</span>
                </div>
                <div
                    class="flex w-full items-center gap-1.5 rounded-sm py-1.5 pr-2 pl-[--spacing(var(--tree-indent))] text-xs hover:bg-elevated cursor-pointer"
                    :style="{
                        '--tree-indent': 5,
                    }"
                    @click="open('events')"
                >
                    <UiIcon name="i-mingcute:list-check-line" class="size-3 shrink-0 text-muted" />
                    <span class="truncate">events</span>
                </div>
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
    open(payload: { workflow: Workflow; view: string; step?: number }) {
        return true;
    },
});

const { data: steps } = useStoreView(workflowStore, "steps", (record) => {
    return record[props.workflow.identity] ?? [];
});

const { execute: executeGetSteps, loading: loadingSteps } = useStoreAction(workflowStore, "getStepsById", {
    isolated: true,
});

const loaded = ref(false);
const expanded = ref(false);
const stepsExpanded = ref(false);

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

    if (!loaded.value) {
        try {
            await executeGetSteps({ payload: { identity: props.workflow.identity } });

            loaded.value = true;
        } catch (error) {
            return dangerToast("Failed to load steps", error as Error);
        }
    }

    stepsExpanded.value = true;
}
</script>
