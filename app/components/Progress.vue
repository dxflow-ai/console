<template>
    <svg class="size-full -rotate-90" fill="none" :viewBox="`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`">
        <circle class="stroke-default" stroke-width="2" :cx="VIEW_SIZE / 2" :cy="VIEW_SIZE / 2" :r="RADIUS" />
        <circle
            class="transition-[stroke-dashoffset] duration-300"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            :cx="VIEW_SIZE / 2"
            :cy="VIEW_SIZE / 2"
            :r="RADIUS"
            :stroke-dasharray="CIRCUMFERENCE"
            :stroke-dashoffset="offset"
        />
    </svg>
</template>

<script lang="ts" setup>
const props = defineProps({
    percent: {
        type: Number,
        default: 0,
    },
});

const VIEW_SIZE = 32;
const RADIUS = 14;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const offset = computed(() => {
    const percent = Math.min(Math.max(props.percent, 0), 100);

    return CIRCUMFERENCE * (1 - percent / 100);
});
</script>
