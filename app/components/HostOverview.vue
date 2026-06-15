<template>
    <UiCard
        variant="soft"
        :ui="{
            header: 'flex items-center justify-between gap-4',
        }"
    >
        <template #header>
            <div class="flex items-center gap-2">
                <UiIcon name="i-mingcute:computer-line" class="size-4 text-primary" />
                <span class="text-sm text-muted">Host</span>
            </div>
            <template v-if="engineState.attribute.host.boot">
                <div class="flex items-center gap-1 text-muted">
                    <span class="text-xs">Boot at</span>
                    <DateLabel
                        class="text-xs"
                        month="short"
                        day="numeric"
                        hour="numeric"
                        minute="numeric"
                        :timestamp="engineState.attribute.host.boot"
                    />
                </div>
            </template>
            <template v-else>
                <UiSkeleton class="h-4 w-32" />
            </template>
        </template>
        <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between gap-8">
                <span class="text-sm font-bold">Os</span>
                <div class="flex items-center gap-1">
                    <template v-if="engineState.attribute.host.os">
                        <UiBadge size="sm" variant="soft" color="primary">
                            <span class="font-bold capitalize">{{ engineState.attribute.host.os }}</span>
                        </UiBadge>
                        <UiBadge size="sm" variant="soft" color="teal">
                            <span class="uppercase">{{ engineState.attribute.host.arch }}</span>
                        </UiBadge>
                    </template>
                    <template v-else>
                        <UiSkeleton class="h-5.5 w-16" />
                        <UiSkeleton class="h-5.5 w-12" />
                    </template>
                </div>
            </div>
            <div class="flex items-center justify-between gap-8">
                <span class="text-sm font-bold">Version</span>
                <div class="flex items-center gap-1">
                    <template v-if="engineState.attribute.host.platform">
                        <UiBadge size="sm" variant="soft" color="primary">
                            <span class="font-bold capitalize">{{ engineState.attribute.host.platform }}</span>
                        </UiBadge>
                        <UiBadge size="sm" variant="soft" color="teal">
                            <span class="uppercase">{{ engineState.attribute.host.version }}</span>
                        </UiBadge>
                    </template>
                    <template v-else>
                        <UiSkeleton class="h-5.5 w-16" />
                        <UiSkeleton class="h-5.5 w-10" />
                    </template>
                </div>
            </div>
        </div>
    </UiCard>
</template>
