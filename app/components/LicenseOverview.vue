<template>
    <UiCard
        :ui="{
            root: 'divide-none',
            body: '!pt-0 !px-5',
            header: 'flex items-center gap-4 justify-between !px-5 !pb-0',
        }"
        variant="soft"
    >
        <template #header>
            <div class="flex items-center gap-2">
                <UiIcon name="i-mingcute:certificate-2-line" class="size-4 text-primary-500" />
                <span class="text-sm text-muted">License</span>
            </div>
            <template v-if="engineState.license.expires">
                <div class="flex items-center gap-1 text-muted">
                    <span class="text-xs">Expires in</span>
                    <DateLabel
                        :timestamp="engineState.license.expires"
                        class="text-xs"
                        year="numeric"
                        month="short"
                        day="numeric"
                    />
                </div>
            </template>
            <template v-else>
                <UiSkeleton class="h-4 w-32 bg-primary-100/50 dark:bg-primary-950/50" />
            </template>
        </template>
        <UiSeparator class="mt-2 mb-6" />
        <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between gap-8">
                <span class="text-sm font-bold">Name</span>
                <div class="flex items-center gap-1">
                    <template v-if="engineState.license.name">
                        <UiBadge size="sm" variant="soft" color="primary">
                            <span class="font-bold">{{ engineState.license.name }}</span>
                        </UiBadge>
                        <UiBadge size="sm" variant="soft" color="teal">
                            <span>{{ engineState.license.owner }}</span>
                        </UiBadge>
                    </template>
                    <template v-else>
                        <UiSkeleton class="h-5.5 w-18 bg-primary-100/50 dark:bg-primary-950/50" />
                        <UiSkeleton class="h-5.5 w-14 bg-primary-100/50 dark:bg-primary-950/50" />
                    </template>
                </div>
            </div>
            <div class="flex items-center justify-between gap-8">
                <span class="text-sm font-bold">Permission</span>
                <div class="flex items-center gap-1 flex-wrap justify-end">
                    <template v-if="engineState.license.name">
                        <template v-for="(_, key) in engineState.license.permission" :key="key">
                            <UiBadge size="sm" variant="soft" color="teal">
                                <span class="font-bold capitalize">{{ key }}</span>
                            </UiBadge>
                        </template>
                    </template>
                    <template v-else>
                        <UiSkeleton class="h-5.5 w-16 bg-primary-100/50 dark:bg-primary-950/50" />
                        <UiSkeleton class="h-5.5 w-16 bg-primary-100/50 dark:bg-primary-950/50" />
                        <UiSkeleton class="h-5.5 w-16 bg-primary-100/50 dark:bg-primary-950/50" />
                    </template>
                </div>
            </div>
        </div>
    </UiCard>
</template>

<script lang="ts" setup>
import DateLabel from "~/components/DateLabel.vue";
</script>
