<template>
    <UiCard
        ref="element"
        :ui="{
            root: 'divide-none',
            body: '!pt-0 !px-5',
            header: 'flex items-center gap-4 justify-between !px-5 !pb-0',
        }"
        variant="soft"
    >
        <template #header>
            <div class="flex items-center gap-2">
                <UiIcon name="i-mingcute:storage-line" class="size-4 text-primary-500" />
                <span class="text-sm text-muted">Memory</span>
            </div>
            <template v-if="engineState.attribute.memory.physical">
                <div class="flex items-center gap-1 text-muted">
                    <span class="text-xs">{{ physicalLabel }}</span>
                    <template v-if="engineState.attribute.memory.swap">
                        <span class="text-xs opacity-75">+</span>
                        <span class="text-xs">{{ swapLabel }}</span>
                    </template>
                </div>
            </template>
            <template v-else>
                <UiSkeleton class="h-4 w-12 bg-primary-100/50 dark:bg-primary-950/50" />
            </template>
        </template>
        <UiSeparator class="mt-2 mb-6" />
        <div class="flex h-20 items-center gap-4 pr-0.5">
            <div class="flex flex-1">
                <VisXYContainer
                    :key="redrawKey"
                    :data="data"
                    :height="calcScale(80)"
                    :padding="{
                        top: 2,
                        left: 2,
                        right: 2,
                        bottom: 2,
                    }"
                >
                    <VisLine
                        :x="xData"
                        :y="ySwapData"
                        :color="colors.swap"
                        :curve-type="CurveType.Bundle"
                        :duration="1500"
                        :line-width="calcScale(1.5)"
                        :attributes="{
                            [Line.selectors.linePath]: {
                                'stroke-linecap': 'round',
                            },
                        }"
                    />
                    <VisLine
                        :x="xData"
                        :y="yPhysicalData"
                        :color="colors.physical"
                        :curve-type="CurveType.Basis"
                        :duration="1000"
                        :line-width="calcScale(3)"
                        :attributes="{
                            [Line.selectors.linePath]: {
                                'stroke-linecap': 'round',
                            },
                        }"
                    />
                </VisXYContainer>
            </div>
            <div class="relative flex w-40 h-20 flex-col items-center justify-end gap-0.5">
                <div class="absolute top-2 left-1 w-38 h-18">
                    <VisSingleContainer :key="redrawKey" :data="lastSwapData" class="size-full">
                        <VisDonut
                            :value="vData"
                            :radius="calcScale(72)"
                            :arc-width="calcScale(3)"
                            :corner-radius="calcScale(3)"
                            :angle-range="[-1.5707963267948966, 1.5707963267948966]"
                            :color="[colors.swap, 'transparent']"
                            :duration="1500"
                            show-background
                        />
                    </VisSingleContainer>
                </div>
                <div class="absolute top-0 left-0 w-40 h-20">
                    <VisSingleContainer :key="redrawKey" :data="lastPhysicalData" class="size-full">
                        <VisDonut
                            :value="vData"
                            :radius="calcScale(80)"
                            :arc-width="calcScale(6)"
                            :corner-radius="calcScale(6)"
                            :angle-range="[-1.5707963267948966, 1.5707963267948966]"
                            :color="['transparent', colors.physical]"
                            :duration="1000"
                            show-background
                        />
                    </VisSingleContainer>
                </div>
                <UiBadge
                    :ui="{
                        base: 'rounded-full z-10',
                    }"
                    size="sm"
                    variant="soft"
                    color="teal"
                >
                    <span>Swap</span>
                    <span class="font-bold">{{ Math.floor(last.swap) }}</span>
                    <small>%</small>
                </UiBadge>
                <UiBadge
                    :ui="{
                        base: 'rounded-full z-10',
                    }"
                    size="sm"
                    variant="soft"
                    color="primary"
                >
                    <span>Physical</span>
                    <span class="font-bold">{{ Math.floor(last.physical) }}</span>
                    <small>%</small>
                </UiBadge>
            </div>
        </div>
    </UiCard>
</template>

<script lang="ts" setup>
import prettyBytes from "pretty-bytes";
import { CurveType, Line } from "@unovis/ts";
import { VisXYContainer, VisSingleContainer, VisLine, VisDonut } from "@unovis/vue";

const colors = {
    physical: "var(--ui-primary)",
    swap: "var(--ui-teal)",
};

const element = useTemplateRef("element");
const elementSize = useElementSize(element);
const redrawKey = refDebounced(elementSize.width, 50);

const { calcScale } = useScale();

const data = computed(() => {
    const output: {
        physical: number;
        swap: number;
    }[] = [];
    for (const points of engineState.stat.memory) {
        output.push({
            physical: points["physical"].percent,
            swap: points["swap"].percent,
        });
    }

    if (output.length === 0) {
        output.push(
            {
                physical: 1,
                swap: 0,
            },
            {
                physical: 1,
                swap: 0,
            },
        );
    }

    return output;
});
const last = computed(() => {
    const point = data.value?.[data.value?.length - 1];
    return {
        physical: point?.physical ?? 0,
        swap: point?.swap ?? 0,
    };
});
const lastPhysicalData = computed(() => {
    let { physical } = last.value;
    if (physical < 10) {
        physical = 10;
    }

    if (physical > 100) {
        physical = 100;
    }

    return [100 - physical, physical];
});

const lastSwapData = computed(() => {
    let { swap } = last.value;
    if (swap < 10) {
        swap = 10;
    }

    if (swap > 100) {
        swap = 100;
    }

    return [swap, 100 - swap];
});

const physicalLabel = computed(() => {
    const value = prettyBytes(engineState.attribute.memory.physical, {
        binary: true,
    });
    return value.replaceAll("i", "");
});

const swapLabel = computed(() => {
    const value = prettyBytes(engineState.attribute.memory.swap, {
        binary: true,
    });
    return value.replaceAll("i", "");
});

const swap = computed(() => {
    let { swap } = last.value;
    if (swap < 10) {
        swap = 10;
    }

    if (swap > 100) {
        swap = 100;
    }

    return [swap, 200 - swap];
});

function xData(_: any, index: number) {
    return index;
}

function yPhysicalData({ physical }: { physical: number }) {
    return physical;
}

function ySwapData({ swap }: { swap: number }) {
    return swap;
}

function vData(data: number) {
    return data;
}
</script>

<style lang="scss" scoped>
.unovis-single-container {
    --vis-donut-background-color: var(--ui-border);
}
</style>
