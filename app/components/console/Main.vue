<template>
    <div class="flex min-h-0 flex-1">
        <template v-if="sidebarOpen">
            <ConsoleSidebar />
        </template>

        <div class="flex min-w-0 flex-1 flex-col">
            <template v-if="!panelFull">
                <div class="flex min-h-0 flex-1 flex-col">
                    <ConsoleContent />
                </div>
            </template>

            <template v-if="panelOpen">
                <div
                    class="flex shrink-0 flex-col"
                    :class="panelFull ? 'min-h-0 flex-1' : 'h-48 border-t border-default'"
                >
                    <ConsolePanel />
                </div>
            </template>
        </div>
    </div>
</template>

<script lang="ts" setup>
const { sidebarOpen, panelOpen, panelFull } = useWorkspace();
</script>
