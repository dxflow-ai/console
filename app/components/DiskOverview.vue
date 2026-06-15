<template>
    <UiCard
        variant="soft"
        :ui="{
            header: 'flex items-center justify-between gap-4',
        }"
    >
        <template #header>
            <div class="flex items-center gap-2">
                <UiIcon name="i-mingcute:drive-line" class="size-4 text-primary" />
                <span class="text-sm text-muted">Disk</span>
            </div>
            <template v-if="engineState.attribute.disk.length">
                <div class="flex items-center gap-1 text-muted">
                    <span class="text-xs">{{ engineState.attribute.disk.length }} Devices</span>
                </div>
            </template>
            <template v-else>
                <UiSkeleton class="h-4 w-16" />
            </template>
        </template>
        <div class="flex flex-col gap-4">
            <template v-for="disk in disks">
                <div class="flex items-center gap-8">
                    <span class="text-sm font-bold capitalize">{{ disk.name }}</span>
                    <div class="flex flex-1 items-center justify-end gap-4">
                        <div class="flex w-full max-w-48 mb-2">
                            <UiProgress size="sm" :model-value="disk.percent" :max="100" />
                        </div>
                        <div class="flex items-center gap-1 text-nowrap">
                            <UiBadge size="sm" variant="soft" color="primary">
                                <span>Used</span>
                                <span class="font-bold">{{ prettyBytes(disk.value, prettyBytesOptions) }}</span>
                            </UiBadge>
                            <UiBadge size="sm" variant="soft" color="teal">
                                <span>Total</span>
                                <span class="font-bold">{{ prettyBytes(disk.size) }}</span>
                            </UiBadge>
                        </div>
                    </div>
                </div>
            </template>
            <template v-if="!disks.length">
                <div class="flex items-center gap-8">
                    <UiSkeleton class="h-5 w-16" />
                    <div class="flex flex-1 items-center justify-end gap-4">
                        <div class="flex items-center gap-1 text-nowrap">
                            <UiSkeleton class="h-5 w-24" />
                            <UiSkeleton class="h-5 w-24" />
                        </div>
                    </div>
                </div>
            </template>
        </div>
    </UiCard>
</template>

<script lang="ts" setup>
import prettyBytes from "pretty-bytes";

const prettyBytesOptions = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
};

const disks = computed(() => {
    const output: {
        path: string;
        name: string;
        size: number;
        percent: number;
        value: number;
    }[] = [];

    const point = engineState.stat.disk?.[engineState.stat.disk?.length - 1];
    for (const key in point) {
        const stat = point[key];

        const attribute = engineState.attribute.disk.find(({ path }: { path: string }) => {
            return path === key;
        });

        output.push({
            path: key,
            name: attribute?.name || "unknown",
            size: attribute?.size || stat.value,
            percent: stat.percent,
            value: stat.value * 1024 * 1024,
        });
    }

    return output;
});
</script>
