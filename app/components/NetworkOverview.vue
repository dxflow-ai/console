<template>
    <UiCard
        variant="soft"
        :ui="{
            header: 'flex items-center justify-between gap-4',
        }"
    >
        <template #header>
            <div class="flex items-center gap-2">
                <UiIcon name="i-mingcute:router-modem-line" class="size-4 text-primary" />
                <span class="text-sm text-muted">Network</span>
            </div>
            <template v-if="engineState.attribute.network.length">
                <div class="flex items-center gap-1 text-muted">
                    <span class="text-xs">{{ engineState.attribute.network.length }} Interfaces</span>
                </div>
            </template>
            <template v-else>
                <UiSkeleton class="h-4 w-16" />
            </template>
        </template>
        <div class="flex flex-col gap-4">
            <template v-for="network in networks">
                <div class="flex items-center gap-8">
                    <span class="text-sm font-bold">{{ network.name }}</span>
                    <div class="flex flex-1 items-center justify-end gap-1">
                        <UiBadge size="sm" variant="soft" color="primary">
                            <span>Sent</span>
                            <span class="font-bold">{{ prettyBytes(network.sent, prettyBytesOptions) }}</span>
                            <UiIcon name="i-mingcute:arrow-up-line" />
                        </UiBadge>
                        <UiBadge size="sm" variant="soft" color="teal">
                            <span>Received</span>
                            <span class="font-bold">{{ prettyBytes(network.received, prettyBytesOptions) }}</span>
                            <UiIcon name="i-mingcute:arrow-down-line" />
                        </UiBadge>
                    </div>
                </div>
            </template>
            <template v-if="!networks.length">
                <div class="flex items-center gap-8">
                    <UiSkeleton class="h-5 w-16" />
                    <div class="flex flex-1 items-center justify-end gap-4">
                        <div class="flex items-center gap-1 text-nowrap">
                            <UiSkeleton class="h-5 w-28" />
                            <UiSkeleton class="h-5 w-28" />
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

const networks = computed(() => {
    const output: {
        name: string;
        address: string;
        sent: number;
        received: number;
    }[] = [];

    const point = engineState.stat.network?.[engineState.stat.network?.length - 1];
    for (const key in point) {
        const stat = point[key];

        const attribute = engineState.attribute.network.find(({ name }: { name: string }) => {
            return name === key;
        });

        output.push({
            name: attribute?.name || "unknown",
            address: attribute?.address || "unknown",
            sent: stat.sent,
            received: stat.received,
        });
    }

    return output;
});
</script>
