<template>
    <div
        class="flex min-w-72 max-w-80 flex-col gap-2.5 rounded-xl border border-default bg-default p-3 transition-colors"
    >
        <div class="flex items-start gap-2.5">
            <div class="flex size-9 shrink-0 items-center justify-center rounded-lg transition-all" :class="badgeClass">
                <UiIcon
                    class="size-5"
                    :name="icon"
                    :class="{
                        'animate-spin': running,
                    }"
                />
            </div>
            <div class="flex min-w-0 flex-1 flex-col gap-0.5">
                <div class="flex items-center gap-2">
                    <span class="truncate text-sm font-medium text-highlighted">{{ title(props.step.name) }}</span>
                    <template v-if="config.platform">
                        <UiBadge size="sm" variant="soft" color="neutral" class="shrink-0 capitalize">
                            <span>{{ config.platform }}</span>
                        </UiBadge>
                    </template>
                    <span class="ml-auto shrink-0 font-mono text-xs text-dimmed">#{{ props.step.index }}</span>
                </div>
                <span class="truncate font-mono text-xs text-dimmed">
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
        <template v-if="props.startable">
            <div class="flex justify-end pt-2.5">
                <UiButton
                    size="xs"
                    color="neutral"
                    variant="solid"
                    label="Start"
                    icon="i-mingcute:play-fill"
                    :loading="props.starting"
                    :disabled="props.busy"
                    :ui="{
                        leadingIcon: 'size-3',
                    }"
                    @click="start()"
                />
            </div>
        </template>
        <template v-if="props.stoppable">
            <div class="flex justify-end pt-2.5">
                <UiButton
                    size="xs"
                    color="neutral"
                    variant="solid"
                    label="Stop"
                    icon="i-mingcute:pause-fill"
                    :loading="props.stopping"
                    :disabled="props.busy"
                    :ui="{
                        leadingIcon: 'size-3',
                    }"
                    @click="stop()"
                />
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
    startable: {
        type: Boolean,
        default: false,
    },
    stoppable: {
        type: Boolean,
        default: false,
    },
    starting: {
        type: Boolean,
        default: false,
    },
    stopping: {
        type: Boolean,
        default: false,
    },
    busy: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits({
    start() {
        return true;
    },
    stop() {
        return true;
    },
});

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

const badgeClass = computed(() => {
    if (props.step.status === WorkflowStepStatus.RUNNING) {
        return "bg-blue-500/10 text-blue-500";
    }

    if (props.step.status === WorkflowStepStatus.EXITED) {
        return props.step.exit_code ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500";
    }

    return "bg-elevated text-dimmed";
});

const dotClass = computed(() => {
    if (props.step.status === WorkflowStepStatus.RUNNING) {
        return "bg-blue-500";
    }

    if (props.step.status === WorkflowStepStatus.EXITED) {
        return props.step.exit_code ? "bg-red-500" : "bg-green-500";
    }

    return "bg-neutral-400";
});

const icon = computed(() => {
    if (props.step.status === WorkflowStepStatus.RUNNING) {
        return "i-mingcute:loading-3-fill";
    }

    if (props.step.status === WorkflowStepStatus.EXITED) {
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
    const rows: string[] = [];

    if (config.value.ports?.length) {
        for (const port of config.value.ports ?? []) {
            rows.push(`${port.host}:${port.container}`);
        }
    }

    if (config.value.volumes?.length) {
        for (const volume of config.value.volumes ?? []) {
            rows.push(`${volume.host}:${volume.container}`);
        }
    }

    if (config.value.env?.length) {
        for (const entry of config.value.env ?? []) {
            rows.push(entry);
        }
    }

    return rows;
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
    emit("start");
}

function stop() {
    emit("stop");
}
</script>
