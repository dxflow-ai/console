<template>
    <div class="flex flex-col gap-4 text-xs">
        <div class="flex items-center gap-3">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-elevated">
                <UiIcon name="i-mingcute:server-2-line" class="size-5 text-muted" />
            </div>
            <div class="flex min-w-0 flex-1 flex-col gap-0.5">
                <span class="truncate text-sm font-semibold text-default">{{ host.name || "Unknown" }}</span>
                <span class="truncate text-muted">
                    {{ host.os || "—" }}<template v-if="host.version"> {{ host.version }}</template>
                    <template v-if="host.arch"> · {{ host.arch }}</template>
                </span>
            </div>
        </div>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Stat
                label="CPU"
                icon="i-mingcute:chip-line"
                unit="%"
                :value="cpu"
                :points="cpuHistory"
                :caption="model ? `${model} · ${cores} cores` : `${cores} cores`"
                :meta="`peak ${peak(cpuHistory)}%`"
            />
            <Stat
                label="Memory"
                icon="i-mingcute:server-line"
                unit="%"
                :value="memory"
                :points="memoryHistory"
                :caption="prettyBytes(memoryTotal)"
                :meta="`peak ${peak(memoryHistory)}%`"
            />
            <template v-if="disk.count">
                <Stat
                    label="Disk"
                    icon="i-mingcute:storage-line"
                    unit="%"
                    :value="disk.percent"
                    :points="disk.history"
                    :caption="prettyBytes(disk.size)"
                    :meta="`peak ${peak(disk.history)}%`"
                />
            </template>
            <template v-if="network.count">
                <Stat
                    label="Network"
                    icon="i-mingcute:world-2-line"
                    accent="text-primary"
                    :value="networkRate.value"
                    :unit="networkRate.unit"
                    :points="network.history"
                    :caption="`${network.count} ${network.count === 1 ? 'interface' : 'interfaces'}`"
                    :meta="`↑ ${prettyBytes(network.sent)}/s`"
                />
            </template>
        </div>
    </div>
</template>

<script lang="ts" setup>
import prettyBytes from "pretty-bytes";

const { cpu, memory, cores, model, memoryTotal, cpuHistory, memoryHistory, disk, network } = useEngineStats();

const host = computed(() => {
    return engineStore.view.attribute.value.host;
});

const networkRate = computed(() => {
    const [value, unit = "B"] = prettyBytes(network.value.received).split(" ");

    return { value, unit: `${unit}/s` };
});

function peak(points: number[]) {
    return points.length ? Math.round(Math.max(...points)) : 0;
}
</script>
