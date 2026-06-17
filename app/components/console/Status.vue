<template>
    <UiPopover
        :content="{
            side: 'top',
            align: 'start',
            sideOffset: 6,
        }"
    >
        <button type="button" class="flex items-center gap-1.5 hover:text-default">
            <span class="size-2 rounded-full" :class="connectionClass" />
            <span class="font-medium text-default">{{ host.name || "Unknown" }}</span>
        </button>

        <template #content>
            <div class="flex w-60 flex-col gap-2 p-2 text-xs">
                <ConsoleInfoCard title="Engine">
                    <ConsoleInfoRow label="Version" :value="attribute.version || '—'" />
                    <ConsoleInfoRow label="License" :value="license.name || '—'" />
                    <ConsoleInfoRow label="Uptime">
                        <template v-if="attribute.boot">
                            <RelativeTime :timestamp="attribute.boot" />
                        </template>
                        <template v-else>
                            <span>—</span>
                        </template>
                    </ConsoleInfoRow>
                </ConsoleInfoCard>

                <ConsoleInfoCard title="System">
                    <ConsoleInfoRow label="OS" :value="host.os ? `${host.os} · ${host.arch}` : '—'" />
                    <ConsoleInfoRow
                        label="CPU"
                        :value="attribute.cpu.model ? `${attribute.cpu.model} · ${attribute.cpu.cores}c` : '—'"
                    />
                    <ConsoleInfoRow label="Memory" :value="prettyBytes(attribute.memory.physical || 0)" />
                </ConsoleInfoCard>
            </div>
        </template>
    </UiPopover>
</template>

<script lang="ts" setup>
import prettyBytes from "pretty-bytes";

const attribute = computed(() => {
    return engineStore.view.attribute.value;
});

const ping = computed(() => {
    return engineStore.view.ping.value;
});

const host = computed(() => {
    return engineStore.view.attribute.value.host;
});

const license = computed(() => {
    return engineStore.view.license.value;
});

const connectionClass = computed(() => {
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
