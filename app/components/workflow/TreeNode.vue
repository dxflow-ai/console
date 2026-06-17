<template>
    <div>
        <div class="flex items-center gap-1 rounded-sm py-1 pr-1 pl-2 text-sm hover:bg-elevated">
            <button type="button" class="flex min-w-0 flex-1 items-center gap-1.5" @click="toggle()">
                <UiIcon
                    class="size-4 shrink-0 text-muted"
                    :name="expanded ? 'i-mingcute:down-small-fill' : 'i-mingcute:right-small-fill'"
                />
                <StatusDot :status="props.workflow.status" />
                <span class="truncate">{{ props.workflow.name }}</span>
            </button>
            <UiDropdownMenu
                :items="contextItems"
                :content="{
                    side: 'bottom',
                    align: 'end',
                    sideOffset: 4,
                }"
            >
                <UiButton
                    icon="i-mingcute:more-2-line"
                    size="xs"
                    variant="ghost"
                    color="neutral"
                    :ui="{ base: 'focus-visible:ring-0 focus:outline-none' }"
                    square
                />
            </UiDropdownMenu>
        </div>

        <template v-if="expanded">
            <button
                type="button"
                class="flex w-full items-center gap-1.5 py-1 pr-2 pl-8 text-sm hover:bg-elevated"
                @click="open('diagram')"
            >
                <UiIcon name="i-mingcute:git-branch-line" class="size-4 shrink-0 text-muted" />
                <span class="truncate">Diagram</span>
            </button>

            <button
                type="button"
                class="flex w-full items-center gap-1.5 py-1 pr-2 pl-8 text-sm hover:bg-elevated"
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
                    :class="['size-4 shrink-0 text-muted', { 'animate-spin': loadingSteps }]"
                />
                <span class="truncate">steps</span>
            </button>

            <template v-if="stepsExpanded">
                <template v-for="step in steps" :key="step.identity">
                    <button
                        type="button"
                        class="flex w-full items-center gap-1.5 py-1 pr-2 pl-14 text-sm hover:bg-elevated"
                        @click="open('step', step.index)"
                    >
                        <StatusDot :status="step.status" />
                        <span class="truncate">{{ step.name }}</span>
                    </button>
                </template>
            </template>

            <button
                type="button"
                class="flex w-full items-center gap-1.5 py-1 pr-2 pl-8 text-sm hover:bg-elevated"
                @click="open('logs')"
            >
                <UiIcon name="i-mingcute:terminal-line" class="size-4 shrink-0 text-muted" />
                <span class="truncate">logs</span>
            </button>

            <button
                type="button"
                class="flex w-full items-center gap-1.5 py-1 pr-2 pl-8 text-sm hover:bg-elevated"
                @click="open('events')"
            >
                <UiIcon name="i-mingcute:list-check-line" class="size-4 shrink-0 text-muted" />
                <span class="truncate">events</span>
            </button>
        </template>
    </div>
</template>

<script lang="ts" setup>
import type { DropdownMenuItem } from "@nuxt/ui";

const props = defineProps({
    workflow: {
        type: Object as PropType<Workflow>,
        required: true,
    },
});

const emit = defineEmits({
    open: null,
    remove: null,
});

const { data: stepsRecord } = useStoreView(workflowStore, "steps");

const expanded = ref(false);
const stepsExpanded = ref(false);
const loadingSteps = ref(false);
const starting = ref(false);
const stopping = ref(false);

const steps = computed<WorkflowStep[]>(() => {
    return stepsRecord.value[props.workflow.identity] ?? [];
});

const canStart = computed(() => {
    return [WorkflowStatus.CREATED, WorkflowStatus.STOPPED, WorkflowStatus.EXITED].includes(props.workflow.status);
});

const canStop = computed(() => {
    return props.workflow.status === WorkflowStatus.STARTED;
});

const contextItems = computed<DropdownMenuItem[]>(() => {
    const items: DropdownMenuItem[] = [];

    if (canStart.value) {
        items.push({
            label: "Start",
            icon: "i-mingcute:play-line",
            loading: starting.value,
            onSelect() {
                start();
            },
        });
    }

    if (canStop.value) {
        items.push({
            label: "Stop",
            icon: "i-mingcute:stop-line",
            loading: stopping.value,
            onSelect() {
                stop();
            },
        });
    }

    items.push({
        label: "Remove",
        icon: "i-mingcute:delete-3-line",
        color: "red",
        onSelect() {
            emit("remove", props.workflow);
        },
    });

    return items;
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
        loadingSteps.value = true;

        try {
            await workflowStore.action.getStepsById({ payload: { identity: props.workflow.identity } });
        } catch (error) {
            loadingSteps.value = false;
            return dangerToast("Failed to load steps", error as Error);
        }

        loadingSteps.value = false;
    }

    stepsExpanded.value = true;
}

async function start() {
    starting.value = true;

    try {
        await workflowStore.action.startById({ payload: { identity: props.workflow.identity } });
    } catch (error) {
        dangerToast(`Failed to start '${props.workflow.name}'`, error as Error);
    }

    starting.value = false;
}

async function stop() {
    stopping.value = true;

    try {
        await workflowStore.action.stopById({ payload: { identity: props.workflow.identity } });
    } catch (error) {
        dangerToast(`Failed to stop '${props.workflow.name}'`, error as Error);
    }

    stopping.value = false;
}
</script>
