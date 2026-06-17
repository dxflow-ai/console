<template>
    <UiPopover
        :content="{
            side: 'top',
            align: 'start',
            sideOffset: 6,
        }"
    >
        <button type="button" class="flex items-center gap-3 hover:text-default">
            <span class="text-nowrap">CPU {{ cpu }}%</span>
            <span class="text-nowrap">Mem {{ memory }}%</span>
        </button>

        <template #content>
            <div class="flex w-56 flex-col gap-2 p-2 text-xs">
                <ConsoleInfoCard title="Usage">
                    <div class="flex items-center gap-2 py-0.5">
                        <span class="w-14 shrink-0 text-muted">CPU</span>
                        <div class="h-6 flex-1">
                            <Sparkline class="text-primary" :points="cpuHistory" />
                        </div>
                        <span class="w-9 shrink-0 text-right font-mono text-default">{{ cpu }}%</span>
                    </div>
                    <div class="flex items-center gap-2 py-0.5">
                        <span class="w-14 shrink-0 text-muted">Memory</span>
                        <div class="h-6 flex-1">
                            <Sparkline class="text-green-500" :points="memoryHistory" />
                        </div>
                        <span class="w-9 shrink-0 text-right font-mono text-default">{{ memory }}%</span>
                    </div>
                </ConsoleInfoCard>

                <template v-if="disks.length">
                    <ConsoleInfoCard title="Disk">
                        <template v-for="entry in disks" :key="entry.name">
                            <ConsoleMeter :label="entry.name" :value="entry.percent" />
                        </template>
                    </ConsoleInfoCard>
                </template>

                <template v-if="networks.length">
                    <ConsoleInfoCard title="Network">
                        <template v-for="entry in networks" :key="entry.name">
                            <div class="flex items-center justify-between gap-3 py-0.5">
                                <span class="shrink-0 truncate text-muted">{{ entry.name }}</span>
                                <span class="shrink-0 font-mono text-default">
                                    ↑{{ prettyBytes(entry.sent) }} ↓{{ prettyBytes(entry.received) }}
                                </span>
                            </div>
                        </template>
                    </ConsoleInfoCard>
                </template>
            </div>
        </template>
    </UiPopover>
</template>

<script lang="ts" setup>
import prettyBytes from "pretty-bytes";

const { cpu, memory, cpuHistory, memoryHistory, disks, networks } = useEngineStats();
</script>
