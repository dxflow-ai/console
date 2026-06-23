<template>
    <footer
        class="flex h-8 w-full items-center gap-3 bg-elevated/50 border-t border-default px-3 text-xs text-muted select-none"
    >
        <ConsoleStatus />
        <template v-if="!isMobile">
            <div class="flex-1" />
            <ConsoleActivity />
            <UiButton
                size="xs"
                variant="link"
                color="neutral"
                icon="i-mingcute:layout-bottom-line"
                class="pr-0!"
                :disabled="!tabs.secondary.length"
                @click="toggleSecondary()"
                square
            />
        </template>
    </footer>
</template>

<script lang="ts" setup>
const { isMobile, toggleSecondary } = useWorkspace();
const { tabs } = useTabs();
</script>
