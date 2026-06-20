<template>
    <div class="flex min-h-0 flex-1 flex-col">
        <template v-if="tabs[props.position].length">
            <div
                class="flex h-8 shrink-0 items-center gap-1.5 overflow-x-auto bg-muted/50 border-b border-default px-3"
            >
                <UiIcon
                    class="size-3.5 shrink-0"
                    :name="props.position === 'primary' ? 'i-mingcute:target-line' : 'i-mingcute:inbox-line'"
                />
                <div class="h-3.5 w-px shrink-0 bg-default" />
                <template v-for="tab in tabs[props.position]" :key="tab.key">
                    <ContextMenu :items="tabMenu(tab)">
                        <UiBadge
                            size="sm"
                            variant="soft"
                            class="shrink-0 cursor-pointer items-center gap-1"
                            :color="tab.key === activeKey[props.position] ? 'primary' : 'neutral'"
                            @click="setActive(props.position, tab.key)"
                        >
                            <UiIcon
                                class="size-3 shrink-0"
                                :class="{
                                    'animate-spin': tabBusy(tab),
                                }"
                                :name="tabBusy(tab) ? 'i-mingcute:loading-3-fill' : tab.icon"
                            />
                            <span class="truncate">{{ tab.label }}</span>
                            <UiIcon
                                name="i-mingcute:close-small-fill"
                                class="ml-1 size-4 shrink-0"
                                @click.stop="closeTab(props.position, tab.key)"
                            />
                        </UiBadge>
                    </ContextMenu>
                </template>
                <template v-if="props.fullscreenable">
                    <div class="flex-1" />
                    <UiButton
                        size="xs"
                        variant="link"
                        color="neutral"
                        class="pr-0!"
                        :icon="secondaryFull ? 'i-mingcute:fullscreen-exit-line' : 'i-mingcute:fullscreen-line'"
                        @click="toggleSecondaryFull()"
                        square
                    />
                </template>
            </div>
            <div class="h-full min-h-0 flex-1 overflow-hidden">
                <template v-if="activeTab?.kind === 'artifact'">
                    <ArtifactView :key="activeTab.key" :artifact="activeTab.payload" />
                </template>
                <template v-else-if="activeTab?.kind === 'workflow'">
                    <WorkflowView
                        :key="activeTab.key"
                        :workflow="activeTab.payload.workflow"
                        :view="activeTab.payload.view"
                        :step="activeTab.payload.step"
                    />
                </template>
                <template v-else-if="activeTab?.kind === 'shell'">
                    <ShellView :key="activeTab.key" class="size-full" :identity="activeTab.payload.identity" />
                </template>
            </div>
        </template>
        <template v-else-if="props.position === 'primary'">
            <ConsoleIntro />
        </template>
    </div>
</template>

<script lang="ts" setup>
import type { ContextMenuItem } from "@nuxt/ui";

const props = defineProps({
    position: {
        type: String as PropType<PanePosition>,
        required: true,
    },
    fullscreenable: {
        type: Boolean,
        default: false,
    },
});

const { tabs, activeKey, closeTab, setActive } = useTabs();
const { secondaryFull, toggleSecondaryFull } = useWorkspace();

const artifactActions = useArtifactActions();
const shellActions = useShellActions();

const activeTab = computed<PaneTab | null>(() => {
    const tab = tabs[props.position].find(({ key }) => {
        return key === activeKey[props.position];
    });

    return tab ?? null;
});

function tabBusy(tab: PaneTab) {
    if (tab.kind === "artifact") {
        return artifactActions.isBusy(tab.payload.identity);
    }

    if (tab.kind === "shell") {
        return shellActions.isBusy(tab.payload.identity);
    }

    return false;
}

function tabMenu(tab: PaneTab): ContextMenuItem[][] | undefined {
    const output: ContextMenuItem[][] = [];

    if (tab.kind === "artifact" || tab.kind === "shell") {
        output.push([
            {
                label: "Remove",
                color: "red",
                disabled: tabBusy(tab),
                onSelect() {
                    if (tab.kind === "artifact") {
                        artifactActions.remove(tab.payload);
                    } else {
                        shellActions.remove(tab.payload);
                    }
                },
            },
        ]);
    }

    return output;
}
</script>
