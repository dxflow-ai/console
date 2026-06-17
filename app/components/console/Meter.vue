<template>
    <div class="flex items-center gap-2 py-0.5">
        <span class="w-14 shrink-0 truncate text-muted">{{ props.label }}</span>
        <div class="h-1 flex-1 overflow-hidden rounded-full bg-elevated">
            <div class="h-full rounded-full transition-all" :class="levelClass" :style="{ width: `${percent}%` }" />
        </div>
        <span class="w-8 shrink-0 text-right font-mono text-default">{{ percent }}%</span>
    </div>
</template>

<script lang="ts" setup>
const props = defineProps({
    label: {
        type: String,
        required: true,
    },
    value: {
        type: Number,
        default: 0,
    },
});

const percent = computed(() => {
    return Math.min(Math.max(Math.round(props.value), 0), 100);
});

const levelClass = computed(() => {
    if (percent.value >= 85) {
        return "bg-red-500";
    }

    if (percent.value >= 60) {
        return "bg-yellow-500";
    }

    return "bg-green-500";
});
</script>
