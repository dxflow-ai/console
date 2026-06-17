<template>
    <div ref="el" class="size-full" />
</template>

<script lang="ts" setup>
import uPlot from "uplot";

const props = defineProps({
    points: {
        type: Array as PropType<number[]>,
        default() {
            return [] as number[];
        },
    },
});

const el = useTemplateRef<HTMLElement>("el");

const { width, height } = useElementSize(el);

let chart: uPlot | null = null;

const data = computed<uPlot.AlignedData>(() => {
    const values = props.points.length ? props.points : [0, 0];

    return [
        values.map((_, index) => {
            return index;
        }),
        values,
    ];
});

watch(data, (value) => {
    chart?.setData(value);
});

watch([width, height], () => {
    chart?.setSize(size());
});

function size() {
    return {
        width: Math.max(Math.round(width.value), 1),
        height: Math.max(Math.round(height.value), 1),
    };
}

function build() {
    if (!el.value || chart) {
        return;
    }

    chart = new uPlot(
        {
            ...size(),
            padding: [2, 2, 2, 2],
            cursor: { show: false },
            legend: { show: false },
            scales: { x: { time: false } },
            axes: [{ show: false }, { show: false }],
            series: [
                {},
                {
                    stroke: getComputedStyle(el.value).color,
                    width: 1.5,
                    points: { show: false },
                },
            ],
        },
        data.value,
        el.value,
    );
}

onMounted(() => {
    build();
});

onBeforeUnmount(() => {
    chart?.destroy();
    chart = null;
});
</script>
