<template>
    <div class="flex flex-col gap-3 overflow-hidden rounded-lg bg-elevated/40 pt-4">
        <div class="flex items-start justify-between gap-2 px-4">
            <div class="flex min-w-0 flex-col gap-1.5">
                <div class="flex items-center gap-2 text-xs font-medium tracking-wide text-muted uppercase">
                    <UiIcon class="size-4 shrink-0" :name="props.icon" />
                    <span class="truncate">{{ props.label }}</span>
                </div>
                <span class="truncate text-xs text-muted">{{ props.caption || "—" }}</span>
            </div>
            <div class="flex shrink-0 flex-col items-end gap-1.5">
                <div class="flex items-baseline gap-0.5 font-mono tabular-nums">
                    <span class="text-3xl leading-none font-semibold text-primary">{{ props.value }}</span>
                    <span class="text-sm text-dimmed">{{ props.unit }}</span>
                </div>
                <template v-if="props.meta">
                    <span class="truncate font-mono text-xs text-dimmed">{{ props.meta }}</span>
                </template>
            </div>
        </div>
        <div class="h-12 text-primary">
            <Sparkline :points="props.points" fill />
        </div>
    </div>
</template>

<script lang="ts" setup>
const props = defineProps({
    label: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
        required: true,
    },
    value: {
        type: [String, Number],
        default: 0,
    },
    unit: {
        type: String,
        default: "",
    },
    caption: {
        type: String,
        default: "",
    },
    meta: {
        type: String,
        default: "",
    },
    points: {
        type: Array as PropType<number[]>,
        default() {
            return [] as number[];
        },
    },
});
</script>
