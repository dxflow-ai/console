<template>
    <footer
        class="flex h-8 w-full items-center gap-3 bg-elevated/50 border-t border-default px-3 text-xs text-muted select-none"
    >
        <ConsoleStatus />
        <div class="flex-1" />
        <ConsoleActivity />
        <UiButton
            size="xs"
            variant="link"
            color="neutral"
            icon="i-mingcute:layout-bottom-line"
            class="pr-0!"
            @click="toggleSecondary()"
            square
        />
    </footer>
</template>

<script lang="ts" setup>
const { toggleSecondary } = useWorkspace();
</script>
