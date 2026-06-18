<template>
    <header class="flex h-9 shrink-0 items-center gap-0.5 border-b border-default px-3 text-sm">
        <UiButton
            size="xs"
            variant="link"
            color="neutral"
            icon="i-mingcute:layout-left-line"
            class="pl-0!"
            @click="toggleSidebar()"
            square
        />
        <ConsoleMenu />
        <div class="flex-1" />
        <ConsoleSession />
    </header>
</template>

<script lang="ts" setup>
const { toggleSidebar } = useWorkspace();
</script>
