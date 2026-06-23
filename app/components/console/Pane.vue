<template>
    <div class="flex min-h-0 flex-1 flex-col">
        <template v-if="tabs[props.position].length">
            <div
                ref="toolbar-element"
                class="flex h-8 shrink-0 items-center gap-1.5 bg-muted/50 border-b border-default px-3"
            >
                <UiIcon
                    class="size-3.5 shrink-0"
                    :name="props.position === 'primary' ? 'i-mingcute:target-line' : 'i-mingcute:inbox-line'"
                />
                <div ref="strip-element" class="relative flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
                    <template v-for="tab in visibleTabs" :key="tab.key">
                        <UiBadge
                            size="sm"
                            variant="soft"
                            class="shrink-0 cursor-pointer items-center gap-1"
                            :data-tab="tab.key"
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
                    </template>
                    <template v-if="overflowTabs.length">
                        <UiDropdownMenu
                            size="xs"
                            :items="overflowItems"
                            :content="{
                                align: 'end',
                            }"
                        >
                            <UiBadge size="sm" variant="soft" color="neutral" class="shrink-0 cursor-pointer">
                                <UiIcon name="i-mingcute:more-1-fill" class="size-4 shrink-0" />
                            </UiBadge>
                        </UiDropdownMenu>
                    </template>
                </div>
                <template v-if="props.fullscreenable">
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
                <template v-if="activeTab?.kind === 'workflow'">
                    <WorkflowView
                        :key="activeTab.key"
                        :workflow="activeTab.payload.workflow"
                        :view="activeTab.payload.view"
                    />
                </template>
                <template v-if="activeTab?.kind === 'artifact'">
                    <ArtifactView :key="activeTab.key" :artifact="activeTab.payload.artifact" />
                </template>
                <template v-if="activeTab?.kind === 'shell'">
                    <ShellView :key="activeTab.key" :identity="activeTab.payload.shell.identity" />
                </template>
            </div>
        </template>
        <template v-else-if="props.position === 'primary'">
            <ConsoleIntro />
        </template>
    </div>
</template>

<script lang="ts" setup>
import type { DropdownMenuItem } from "@nuxt/ui";

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

const { scale } = useScale();
const { tabs, activeKey, closeTab, setActive } = useTabs();
const { secondaryFull, toggleSecondaryFull } = useWorkspace();

const toolbarElement = useTemplateRef<HTMLDivElement>("toolbar-element");
const stripElement = useTemplateRef<HTMLDivElement>("strip-element");

const artifactActions = useArtifactActions();
const shellActions = useShellActions();

const measuring = ref(true);
const visibleCount = ref(Number.POSITIVE_INFINITY);

const activeTab = computed(() => {
    const tab = tabs[props.position].find((item) => {
        return item.key === activeKey[props.position];
    });

    return tab ?? null;
});

const visibleTabs = computed(() => {
    if (measuring.value) {
        return tabs[props.position];
    }

    const head = tabs[props.position].slice(0, visibleCount.value);
    const activeHidden = head.every(({ key }) => {
        return key !== activeTab.value?.key;
    });

    if (activeTab.value && head.length && activeHidden) {
        return [...head.slice(0, -1), activeTab.value];
    }

    return head;
});

const overflowTabs = computed(() => {
    if (measuring.value) {
        return [];
    }

    const shown = new Set(
        visibleTabs.value.map(({ key }) => {
            return key;
        }),
    );

    return tabs[props.position].filter((tab) => {
        return !shown.has(tab.key);
    });
});

const overflowItems = computed(() => {
    return overflowTabs.value.map(({ key, label, icon }) => {
        const item: DropdownMenuItem = {
            label,
            icon,
            onSelect: () => {
                setActive(props.position, key);
            },
        };

        return item;
    });
});

watch(
    () => {
        return tabs[props.position].length;
    },
    () => {
        relayout();
    },
);

function tabBusy(tab: PaneTab) {
    if (tab.kind === "artifact") {
        return artifactActions.isBusy(tab.payload.artifact.identity);
    }

    if (tab.kind === "shell") {
        return shellActions.isBusy(tab.payload.shell.identity);
    }

    return false;
}

async function relayout() {
    measuring.value = true;

    await nextTick();

    const strip = stripElement.value;
    if (strip) {
        const limit = strip.clientWidth - 66 * scale.value;

        const nodes = strip.querySelectorAll<HTMLElement>("[data-tab]");
        const count = [...nodes].reduce((total, node) => {
            if (node.offsetLeft + node.offsetWidth > limit) {
                return total;
            }

            return total + 1;
        }, 0);

        visibleCount.value = Math.max(count, 1);
    }

    measuring.value = false;
}

useResizeObserver(toolbarElement, () => {
    relayout();
});
</script>
