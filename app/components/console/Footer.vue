<template>
    <footer
        class="flex h-8 w-full items-center gap-3 bg-elevated/50 border-t border-default px-3 text-xs text-muted select-none"
    >
        <ConsoleStatus />
        <template v-if="!isMobile">
            <div class="flex-1" />
            <ConsoleActivity />
            <div class="flex items-center">
                <UiButton
                    size="xs"
                    variant="link"
                    color="neutral"
                    icon="i-mingcute:layout-bottom-line"
                    :disabled="!tabs.secondary.length"
                    @click="toggleSecondary()"
                    square
                />
                <UiButton
                    size="xs"
                    variant="link"
                    color="neutral"
                    icon="i-mingcute:layout-right-line"
                    class="pr-0!"
                    @click="toggleSidekick()"
                    square
                />
            </div>
        </template>
    </footer>
</template>

<script lang="ts" setup>
const { isMobile, toggleSecondary, sidekickOpen, toggleSidekick } = useWorkspace();
const { tabs } = useTabs();
</script>
