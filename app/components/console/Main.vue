<template>
    <div class="flex min-h-0 flex-1">
        <template v-if="sidebarOpen">
            <ConsoleSidebar />
        </template>
        <div class="flex min-w-0 flex-1 flex-col">
            <template v-if="primaryVisible">
                <div class="flex min-h-0 flex-1 flex-col">
                    <ConsolePane position="primary" />
                </div>
            </template>
            <template v-if="secondaryVisible">
                <div
                    class="relative flex shrink-0 flex-col"
                    :class="{
                        'min-h-0 flex-1': secondaryFull,
                        'h-1/3 border-t border-default top-[-0.5px]': !secondaryFull,
                    }"
                >
                    <ConsolePane position="secondary" :fullscreen="secondaryFull" fullscreenable />
                </div>
            </template>
        </div>
        <template v-if="sidekickVisible">
            <ConsoleSidekick />
        </template>
    </div>
</template>

<script lang="ts" setup>
const { isMobile, sidebarOpen, secondaryOpen, secondaryFull, sidekickOpen } = useWorkspace();
const { tabs, openWelcome } = useTabs();

const primaryVisible = computed(() => {
    return !secondaryFull.value || !secondaryVisible.value;
});

const secondaryVisible = computed(() => {
    return !isMobile.value && secondaryOpen.value && tabs.secondary.length > 0;
});

const sidekickVisible = computed(() => {
    return !isMobile.value && sidekickOpen.value;
});

onMounted(() => {
    openWelcome();
});
</script>
