<template>
    <div class="flex min-h-0 flex-1 flex-col">
        <template v-if="tabs.length">
            <div class="flex h-9 shrink-0 items-center overflow-x-auto border-b border-default">
                <template v-for="tab in tabs" :key="tab.key">
                    <div
                        class="flex h-full shrink-0 cursor-pointer items-center gap-1.5 border-r border-default px-3 text-sm"
                        :class="tab.key === activeKey ? 'bg-elevated text-default' : 'text-muted hover:bg-elevated/50'"
                        @click="setActive(tab.key)"
                    >
                        <UiIcon class="size-4 shrink-0" :name="tab.icon" />
                        <span class="truncate">{{ tab.label }}</span>
                        <UiIcon
                            name="i-mingcute:close-line"
                            class="size-3.5 shrink-0 text-muted hover:text-default"
                            @click.stop="closeTab(tab.key)"
                        />
                    </div>
                </template>
            </div>

            <template v-if="activeTab?.kind === 'artifact'">
                <ArtifactViewer :key="activeTab.key" :artifact="activeTab.payload" />
            </template>
            <template v-else-if="activeTab?.kind === 'workflow'">
                <WorkflowView
                    :key="activeTab.key"
                    :workflow="activeTab.payload.workflow"
                    :view="activeTab.payload.view"
                    :step="activeTab.payload.step"
                />
            </template>
        </template>
        <template v-else>
            <div class="flex flex-1 items-center justify-center text-xs text-dimmed">No open tabs</div>
        </template>
    </div>
</template>

<script lang="ts" setup>
const { tabs, activeKey, activeTab, closeTab, setActive } = useTabs();
</script>
