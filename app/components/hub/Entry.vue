<template>
    <div
        class="group flex w-full items-center gap-2.5 rounded-sm px-2 py-1.5 text-xs transition-colors hover:bg-elevated"
        :class="{
            'pointer-events-none opacity-60': dimmed,
        }"
    >
        <div
            class="relative flex size-8 shrink-0 items-center justify-center rounded-md transition-all"
            :class="state.badge"
        >
            <template v-if="tracking">
                <Progress class="absolute inset-0" :percent="percent" />
                <span class="font-mono text-xs tabular-nums">{{ percent }}</span>
            </template>
            <template v-else>
                <UiIcon class="size-3.5" :class="state.glyph" :name="state.icon" />
            </template>
        </div>
        <div class="flex min-w-0 flex-1 flex-col gap-0.5">
            <span class="truncate font-semibold transition-colors text-default group-hover:text-highlighted">
                {{ props.workflow.name }}
            </span>
            <span class="truncate" :class="state.caption">{{ caption }}</span>
        </div>
        <UiButton
            icon="i-mingcute:lightning-line"
            size="xs"
            variant="link"
            color="neutral"
            class="shrink-0"
            :disabled="creating"
            :ui="{
                leadingIcon: 'size-3.5',
            }"
            @click="create()"
            square
        />
    </div>
</template>

<script lang="ts" setup>
import { isNumber } from "radash";

const props = defineProps({
    workflow: {
        type: Object as PropType<HubWorkflow>,
        required: true,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits({
    create(payload: { workflow: HubWorkflow }) {
        return true;
    },
});

type EntryState = {
    icon: string;
    glyph: string;
    badge: string;
    caption: string;
    label: string;
};

const idleState: EntryState = {
    icon: "i-hugeicons:package",
    glyph: "",
    badge: "bg-elevated text-muted group-hover:bg-accented group-hover:text-highlighted",
    caption: "text-muted",
    label: "",
};

const deploymentStates: Record<WorkflowDeploymentStatus, EntryState> = {
    creating: {
        icon: "i-mingcute:loading-3-fill",
        glyph: "animate-spin",
        badge: "bg-elevated text-muted",
        caption: "font-mono text-dimmed",
        label: "Preparing the definition",
    },
    created: {
        icon: "i-mingcute:check-circle-line",
        glyph: "",
        badge: "bg-green-500/10 text-green-500",
        caption: "text-green-500",
        label: "Workflow created",
    },
    failed: {
        icon: "i-mingcute:close-circle-line",
        glyph: "",
        badge: "bg-red-500/10 text-red-500",
        caption: "text-red-500",
        label: "Failed to create workflow",
    },
};

const { readDeployment } = useWorkflowDeployment();

const deployment = computed(() => {
    return readDeployment(props.workflow.name);
});

const state = computed(() => {
    const status = deployment.value?.status;

    return status ? deploymentStates[status] : idleState;
});

const creating = computed(() => {
    return deployment.value?.status === "creating";
});

const dimmed = computed(() => {
    return props.disabled && !creating.value;
});

const tracking = computed(() => {
    return creating.value && isNumber(deployment.value?.percent);
});

const percent = computed(() => {
    return deployment.value?.percent ?? 0;
});

const caption = computed(() => {
    if (!deployment.value) {
        return props.workflow.description;
    }

    if (deployment.value.status === "created") {
        return state.value.label;
    }

    return deployment.value.message || state.value.label;
});

function create() {
    emit("create", {
        workflow: props.workflow,
    });
}
</script>
