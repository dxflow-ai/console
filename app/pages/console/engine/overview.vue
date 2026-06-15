<template>
    <HeaderLine>
        <template #tags>
            <UiBadge
                :ui="{
                    base: 'rounded-full',
                }"
                size="sm"
                variant="outline"
                color="teal"
            >
                <span>Controllers</span>
            </UiBadge>
            <UiSeparator orientation="vertical" class="mx-1 h-3" />
            <template v-for="controller in engineState.parameter.controllers" :key="controller">
                <UiBadge
                    :ui="{
                        base: 'rounded-full',
                    }"
                    size="sm"
                    variant="outline"
                    color="neutral"
                >
                    <span class="capitalize">{{ controller.toLowerCase() }}</span>
                </UiBadge>
            </template>
            <template v-if="!engineState.parameter.controllers.length">
                <UiSkeleton class="h-5 w-14" />
                <UiSkeleton class="h-5 w-16" />
            </template>
        </template>
        <template #title>
            <span class="font-bold text-2xl text-nowrap">Engine Overview</span>
        </template>
        <template #actions>
            <UiTooltip
                :delay-duration="500"
                :content="{
                    side: 'left',
                }"
                text="Re-Start"
            >
                <UiButton
                    :ui="{
                        base: 'rounded-full',
                    }"
                    size="sm"
                    variant="outline"
                    color="neutral"
                    square
                >
                    <UiIcon name="i-mingcute:power-line" />
                </UiButton>
            </UiTooltip>
        </template>
        <template #options>
            <template v-if="engineState.attribute.boot">
                <UiBadge
                    :ui="{
                        base: 'rounded-full gap-1 text-nowrap',
                    }"
                    variant="soft"
                    color="neutral"
                >
                    <small class="text-muted">Boot</small>
                    <small class="font-bold">
                        <RelativeTime :timestamp="engineState.attribute.boot" />
                    </small>
                </UiBadge>
            </template>
            <template v-else>
                <UiSkeleton class="h-6 w-20" />
            </template>
            <template v-if="engineState.attribute.version">
                <UiBadge
                    :ui="{
                        base: 'rounded-full gap-1 text-nowrap',
                    }"
                    variant="soft"
                    color="neutral"
                >
                    <small class="text-muted">Version</small>
                    <small class="font-bold">{{ engineState.attribute.version }}</small>
                </UiBadge>
            </template>
            <template v-else>
                <UiSkeleton class="h-6 w-12" />
            </template>
        </template>
    </HeaderLine>
    <div class="grid grid-cols-8 gap-4">
        <HostOverview class="col-span-8 lg:col-span-4 animate-fade-up animate-duration-200 animate-delay-1000" />
        <LicenseOverview class="col-span-8 lg:col-span-4 animate-fade-up animate-duration-200 animate-delay-1100" />
        <CpuOverview class="col-span-8 lg:col-span-4 animate-fade-up animate-duration-200 animate-delay-1200" />
        <MemoryOverview class="col-span-8 lg:col-span-4 animate-fade-up animate-duration-200 animate-delay-1300" />
        <DiskOverview class="col-span-8 lg:col-span-4 animate-fade-up animate-duration-200 animate-delay-1400" />
        <NetworkOverview class="col-span-8 lg:col-span-4 animate-fade-up animate-duration-200 animate-delay-1500" />
    </div>
</template>

<script lang="ts" setup>
import { all, sleep } from "radash";

definePageMeta({
    name: "engine-overview",
    layout: "console",
});

const mounted = ref(true);
async function load() {
    try {
        await all([
            engineStore.action.getStat({ payload: { target: "cpu" } }),
            engineStore.action.getStat({ payload: { target: "memory" } }),
            engineStore.action.getStat({ payload: { target: "disk" } }),
            engineStore.action.getStat({ payload: { target: "network" } }),
        ]);
    } catch (error) {
        dangerToast("Failed to load stats", error);
    }

    await sleep(1000);

    if (mounted.value) {
        engineStore.action.startStatLive();
    }
}

useHead({
    title: "Engine Overview",
});

onMounted(() => {
    load();
});

onUnmounted(() => {
    mounted.value = false;
    engineStore.action.stopStatLive();
});
</script>
