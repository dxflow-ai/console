<template>
    <div
        class="flex min-w-72 max-w-80 flex-col gap-2.5 rounded-xl border border-default bg-default p-3 transition-colors"
    >
        <div class="flex items-start gap-2.5">
            <div
                class="flex size-9.5 shrink-0 items-center justify-center rounded-lg transition-all"
                :class="badgeClass"
            >
                <UiIcon class="size-5" :name="icon" />
            </div>
            <div class="flex min-w-0 flex-1 flex-col">
                <div class="flex items-center gap-2">
                    <span class="truncate text-sm font-medium text-highlighted">{{ title(props.step.name) }}</span>
                    <UiBadge size="xs" variant="soft" color="neutral">
                        <span class="capitalize">{{ config.platform || "unknown" }}</span>
                    </UiBadge>
                    <div class="flax flex-1 j text-right">
                        <span class="font-mono text-xs text-dimmed">#{{ props.step.index }}</span>
                    </div>
                </div>
                <span class="truncate font-mono text-xs text-dimmed -mt-1">
                    <span>{{ config.image || "unknown" }}</span>
                </span>
            </div>
        </div>
        <div class="flex items-center gap-1.5 text-xs text-dimmed">
            <span class="size-1.5 shrink-0 rounded-full transition-all" :class="dotClass" />
            <span class="capitalize">{{ title(props.step.status) }}</span>
            <template v-if="duration">
                <span class="text-muted">-</span>
                <span class="font-mono">{{ duration }}</span>
            </template>
            <template v-if="exited && props.step.exit_code">
                <span class="text-muted">-</span>
                <span class="font-mono text-error">exit {{ props.step.exit_code }}</span>
            </template>
        </div>
        <template v-if="bindings.length">
            <div class="flex flex-col gap-1.5 border-t border-default pt-2.5 text-xs">
                <template v-for="(binding, index) in bindings" :key="index">
                    <div class="flex items-center gap-2">
                        <UiIcon name="i-mingcute:plugin-2-line" class="size-3.5 shrink-0 text-muted" />
                        <span class="truncate font-mono text-toned">{{ binding }}</span>
                    </div>
                </template>
            </div>
        </template>
        <template v-if="controls.length">
            <div class="flex justify-end gap-2 pt-2.5">
                <template v-for="control in controls" :key="control.key">
                    <UiButton
                        size="xs"
                        color="neutral"
                        :variant="control.variant"
                        :label="control.label"
                        :icon="control.icon"
                        :loading="control.loading"
                        :disabled="busy"
                        :ui="{
                            leadingIcon: 'size-3',
                        }"
                        @click="control.handler()"
                    />
                </template>
            </div>
        </template>
    </div>
</template>

<script lang="ts" setup>
import { title } from "radash";

const props = defineProps({
    step: {
        type: Object as PropType<WorkflowStep>,
        required: true,
    },
    definition: {
        type: Object as PropType<WorkflowStepDefinition>,
        default: undefined,
    },
    workflow: {
        type: Object as PropType<Workflow>,
        required: true,
    },
    firstStepIndex: {
        type: Number as PropType<number | null>,
        default: null,
    },
    latestRunningIndex: {
        type: Number as PropType<number | null>,
        default: null,
    },
});

const actions = useWorkflowActions();

const now = useNow({
    interval: 1000,
});

const running = computed(() => {
    return props.step.status === WorkflowStepStatus.RUNNING;
});

const exited = computed(() => {
    return props.step.status === WorkflowStepStatus.EXITED;
});

const config = computed<Partial<WorkflowStepDefinition>>(() => {
    return props.definition ?? {};
});

const busy = computed(() => {
    return actions.isBusy(props.workflow.identity);
});

const startable = computed(() => {
    return canStartWorkflow(props.workflow.status) && props.step.index === props.firstStepIndex;
});

const stoppable = computed(() => {
    return canStopWorkflow(props.workflow.status) && props.step.index === props.latestRunningIndex;
});

const canShell = computed(() => {
    return running.value;
});

const controls = computed(() => {
    const list: Array<{
        key: string;
        label: string;
        icon: string;
        variant: "soft" | "solid";
        loading: boolean;
        handler: () => void;
    }> = [];

    if (canShell.value) {
        list.push({
            key: "shell",
            label: "Shell",
            icon: "i-mingcute:terminal-box-fill",
            variant: "soft",
            loading: actions.shelling.value,
            handler: shell,
        });
    }

    if (startable.value) {
        list.push({
            key: "start",
            label: "Start",
            icon: "i-mingcute:play-fill",
            variant: "solid",
            loading: actions.isBusyWith(props.workflow.identity, "start"),
            handler: start,
        });
    }

    if (stoppable.value) {
        list.push({
            key: "stop",
            label: "Stop",
            icon: "i-mingcute:stop-fill",
            variant: "solid",
            loading: actions.isBusyWith(props.workflow.identity, "stop"),
            handler: stop,
        });
    }

    return list;
});

const badgeClass = computed(() => {
    if (running.value) {
        return "bg-blue-500/10 text-blue-500";
    }

    if (exited.value) {
        return props.step.exit_code ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500";
    }

    return "bg-elevated text-dimmed";
});

const dotClass = computed(() => {
    if (running.value) {
        return "bg-blue-500";
    }

    if (exited.value) {
        return props.step.exit_code ? "bg-red-500" : "bg-green-500";
    }

    return "bg-neutral-400";
});

const icon = computed(() => {
    if (running.value) {
        return "i-mingcute:flash-circle-line";
    }

    if (exited.value) {
        return props.step.exit_code ? "i-mingcute:close-circle-line" : "i-mingcute:check-circle-line";
    }

    return "i-mingcute:time-line";
});

const duration = computed(() => {
    if (!props.step.started_at) {
        return null;
    }

    const start = toMilliseconds(props.step.started_at);
    const end = endTime();

    if (!end || end < start) {
        return null;
    }

    return formatDuration(end - start);
});

const bindings = computed(() => {
    const ports = config.value.ports ?? [];
    const volumes = config.value.volumes ?? [];
    const env = config.value.env ?? [];

    return [
        ...ports.map((port) => {
            return `${port.host}:${port.container}`;
        }),
        ...volumes.map((volume) => {
            return `${volume.host}:${volume.container}`;
        }),
        ...env,
    ];
});

function endTime() {
    if (running.value) {
        return now.value.getTime();
    }

    if (props.step.exited_at) {
        return toMilliseconds(props.step.exited_at);
    }

    return null;
}

function toMilliseconds(value: number) {
    return value < 10_000_000_000 ? value * 1000 : value;
}

function formatDuration(milliseconds: number) {
    const total = Math.floor(milliseconds / 1000);

    const seconds = total % 60;
    const minutes = Math.floor(total / 60) % 60;
    const hours = Math.floor(total / 3600);

    if (hours) {
        return `${hours}h ${minutes}m`;
    }

    if (minutes) {
        return `${minutes}m`;
    }

    return `${seconds}s`;
}

function start() {
    actions.start(props.workflow);
}

function stop() {
    actions.stop(props.workflow);
}

function shell() {
    actions.shell(props.workflow, props.step);
}
</script>
