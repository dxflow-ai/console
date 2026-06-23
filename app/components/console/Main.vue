<template>
    <div class="flex min-h-0 flex-1">
        <template v-if="sidebarOpen">
            <ConsoleSidebar />
        </template>
        <div class="flex min-w-0 flex-1 flex-col">
            <template v-if="!secondaryFull || !secondaryVisible">
                <div class="flex min-h-0 flex-1 flex-col">
                    <ConsolePane position="primary" />
                </div>
            </template>
            <template v-if="secondaryVisible">
                <div
                    class="flex shrink-0 flex-col"
                    :class="secondaryFull ? 'min-h-0 flex-1' : 'h-1/3 border-t border-default'"
                >
                    <ConsolePane position="secondary" fullscreenable />
                </div>
            </template>
        </div>
    </div>
</template>

<script lang="ts" setup>
const { isMobile, sidebarOpen, secondaryOpen, secondaryFull } = useWorkspace();
const { tabs } = useTabs();

const secondaryVisible = computed(() => {
    return !isMobile.value && secondaryOpen.value && tabs.secondary.length > 0;
});
</script>
