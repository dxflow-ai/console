<template>
    <svg class="size-full" preserveAspectRatio="none" fill="none" :viewBox="`0 0 ${VIEW_W} ${VIEW_H}`">
        <defs>
            <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="currentColor" stop-opacity="0.2" />
                <stop offset="100%" stop-color="currentColor" stop-opacity="0.1" />
            </linearGradient>
        </defs>
        <template v-if="props.fill">
            <path :d="geometry.area" :fill="`url(#${gradientId})`" />
        </template>
        <path
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            vector-effect="non-scaling-stroke"
            :d="geometry.line"
        />
    </svg>
</template>

<script lang="ts" setup>
const props = defineProps({
    points: {
        type: Array as PropType<number[]>,
        default() {
            return [] as number[];
        },
    },
    fill: {
        type: Boolean,
        default: false,
    },
});

const gradientId = useId();

const VIEW_W = 100;
const VIEW_H = 32;

const geometry = computed(() => {
    const values = props.points.length > 1 ? props.points : [...props.points, ...props.points, 0];

    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min || 1) * 0.2;
    const low = min - padding;
    const span = max + padding - low || 1;

    const coordinates = values.map((value, index) => {
        const x = (index / (values.length - 1)) * VIEW_W;
        const y = VIEW_H - ((value - low) / span) * VIEW_H;

        return [Number(x.toFixed(2)), Number(y.toFixed(2))];
    });

    let line = `M${coordinates[0][0]} ${coordinates[0][1]}`;
    for (let index = 0; index < coordinates.length - 1; index++) {
        const previous = coordinates[index - 1] ?? coordinates[index];
        const current = coordinates[index];
        const next = coordinates[index + 1];
        const after = coordinates[index + 2] ?? next;

        const control1X = current[0] + (next[0] - previous[0]) / 6;
        const control1Y = current[1] + (next[1] - previous[1]) / 6;
        const control2X = next[0] - (after[0] - current[0]) / 6;
        const control2Y = next[1] - (after[1] - current[1]) / 6;

        line += ` C${control1X.toFixed(2)} ${control1Y.toFixed(2)} ${control2X.toFixed(2)} ${control2Y.toFixed(2)} ${next[0]} ${next[1]}`;
    }

    return {
        line,
        area: `${line} L${VIEW_W} ${VIEW_H} L0 ${VIEW_H} Z`,
    };
});
</script>
