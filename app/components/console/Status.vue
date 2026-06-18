<template>
    <div class="flex items-center gap-4">
        <span class="flex items-center gap-2">
            <span class="size-2.5 rounded-sm" :class="pingStatus" />
            <span class="font-medium text-default">{{ host.name || "Unknown" }}</span>
        </span>
        <UiSeparator orientation="vertical" class="h-3" />
        <div class="flex items-center gap-1 text-xs">
            <span class="font-semibold">Cpu</span>
            <span class="font-mono w-4.5 text-right">{{ cpu }}%</span>
        </div>
        <UiSeparator orientation="vertical" class="h-3" />
        <div class="flex items-center gap-1 text-xs">
            <span class="font-semibold">Mem</span>
            <span class="font-mono w-4.5 text-right">{{ memory }}%</span>
        </div>
    </div>
</template>

<script lang="ts" setup>
const { cpu, memory } = useEngineStats();

const host = computed(() => {
    return engineStore.view.attribute.value.host;
});

const ping = computed(() => {
    return engineStore.view.ping.value;
});

const pingStatus = computed(() => {
    if (!ping.value.latency || ping.value.timeout) {
        return "bg-red-500";
    }

    if (ping.value.latency <= 250) {
        return "bg-green-500";
    }

    if (ping.value.latency <= 750) {
        return "bg-blue-500";
    }

    return "bg-yellow-500";
});
</script>
