<template>
    <UiCard
        ref="element"
        variant="soft"
        :ui="{
            header: 'flex items-center justify-between gap-4',
        }"
    >
        <template #header>
            <div class="flex items-center gap-2">
                <UiIcon name="i-mingcute:chip-line" class="size-4 text-primary" />
                <span class="text-sm text-muted">CPU</span>
            </div>
            <template v-if="engineState.attribute.cpu.cores">
                <div class="flex items-center gap-1 text-muted">
                    <span class="text-xs">{{ engineState.attribute.cpu.cores }} Core</span>
                    <template v-if="engineState.attribute.cpu.model">
                        <span class="text-xs text-muted">-</span>
                        <span class="text-xs">{{ engineState.attribute.cpu.model }}</span>
                    </template>
                </div>
            </template>
            <template v-else>
                <UiSkeleton class="h-4 w-16" />
            </template>
        </template>
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
                        :y="ySystemData"
                        :color="colors.system"
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
                        :y="yUserData"
                        :color="colors.user"
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
                    <VisSingleContainer :key="redrawKey" class="size-full" :data="lastSystemData">
                        <VisDonut
                            :value="vData"
                            :radius="calcScale(72)"
                            :arc-width="calcScale(3)"
                            :corner-radius="calcScale(3)"
                            :angle-range="[-1.5707963267948966, 1.5707963267948966]"
                            :color="['transparent', colors.system]"
                            :duration="1500"
                            show-background
                        />
                    </VisSingleContainer>
                </div>
                <div class="absolute top-0 left-0 w-40 h-20">
                    <VisSingleContainer :key="redrawKey" class="size-full" :data="lastUserData">
                        <VisDonut
                            :value="vData"
                            :radius="calcScale(80)"
                            :arc-width="calcScale(6)"
                            :corner-radius="calcScale(6)"
                            :angle-range="[-1.5707963267948966, 1.5707963267948966]"
                            :color="[colors.user, 'transparent']"
                            :duration="1000"
                            show-background
                        />
                    </VisSingleContainer>
                </div>
                <UiBadge
                    size="sm"
                    variant="soft"
                    color="primary"
                    :ui="{
                        base: 'z-10',
                    }"
                >
                    <span>User</span>
                    <span class="font-bold">{{ Math.floor(last.user) }}</span>
                    <small>%</small>
                </UiBadge>
                <UiBadge
                    size="sm"
                    variant="soft"
                    color="teal"
                    :ui="{
                        base: 'z-10',
                    }"
                >
                    <span>System</span>
                    <span class="font-bold">{{ Math.floor(last.system) }}</span>
                    <small>%</small>
                </UiBadge>
            </div>
        </div>
    </UiCard>
</template>

<script lang="ts" setup>
import { CurveType, Line } from "@unovis/ts";
import { VisXYContainer, VisSingleContainer, VisLine, VisDonut } from "@unovis/vue";

const colors = {
    user: "var(--ui-primary)",
    system: "var(--ui-teal)",
};

const element = useTemplateRef("element");
const elementSize = useElementSize(element);
const redrawKey = refDebounced(elementSize.width, 50);

const { calcScale } = useScale();

const data = computed(() => {
    const output: {
        user: number;
        system: number;
    }[] = [];

    for (const points of engineState.stat.cpu) {
        let cores = 0;

        let user = 0;
        let system = 0;
        for (const key in points) {
            user += points[key].user;
            system += points[key].system;

            cores++;
        }

        output.push({
            user: user / cores,
            system: system / cores,
        });
    }

    if (output.length === 0) {
        output.push(
            {
                user: 1,
                system: 0,
            },
            {
                user: 1,
                system: 0,
            },
        );
    }

    return output;
});

const last = computed(() => {
    const point = data.value?.[data.value?.length - 1];
    return {
        user: point?.user ?? 0,
        system: point?.system ?? 0,
    };
});

const lastUserData = computed(() => {
    let { user } = last.value;
    if (user < 10) {
        user = 10;
    }

    if (user > 100) {
        user = 100;
    }

    return [user, 100 - user];
});

const lastSystemData = computed(() => {
    let { system } = last.value;
    if (system < 10) {
        system = 10;
    }

    if (system > 100) {
        system = 100;
    }

    return [100 - system, system];
});

function xData(_: any, index: number) {
    return index;
}

function yUserData({ user }: { user: number }) {
    return user;
}

function ySystemData({ system }: { system: number }) {
    return system;
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
