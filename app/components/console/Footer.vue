<template>
    <footer class="flex h-8 w-full items-center gap-3 border-t border-default px-3 text-xs text-muted select-none">
        <ConsoleStatus />
        <UiSeparator orientation="vertical" class="h-3" />
        <ConsoleMetrics />
        <div class="flex-1" />
        <ConsoleActivity />
        <ConsoleActions />
    </footer>
</template>
