<template>
    <UiDashboardGroup>
        <UiDashboardSidebar
            id="default"
            :ui="{
                header: 'gap-2',
                footer: 'border-t border-default',
            }"
            :min-size="14"
            :default-size="16"
            :max-size="22"
            collapsible
            resizable
        >
            <template #header="{ collapsed }">
                <div class="flex w-full items-center gap-2 overflow-hidden">
                    <div
                        class="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary-900 dark:bg-primary-100"
                    >
                        <BrandMark class="size-4.5" />
                    </div>
                    <template v-if="!collapsed">
                        <div class="flex min-w-0 flex-1 items-center gap-2">
                            <div class="min-w-0 flex-1">
                                <slot name="header-title" />
                            </div>
                            <slot name="header-badge" />
                        </div>
                        <UiDashboardSidebarCollapse />
                    </template>
                </div>
            </template>

            <template #default="{ collapsed }">
                <UiNavigationMenu
                    orientation="vertical"
                    :items="props.items"
                    :collapsed="collapsed"
                    :tooltip="{
                        delayDuration: 500,
                    }"
                    :ui="{
                        link: 'text-sm',
                        linkLeadingIcon: 'size-4',
                    }"
                />
            </template>

            <template #footer="{ collapsed }">
                <div class="flex w-full items-center" :class="collapsed ? 'flex-col gap-2' : 'gap-1'">
                    <UiButton
                        color="neutral"
                        variant="ghost"
                        size="sm"
                        :icon="colorMode.preference === 'dark' ? 'i-mingcute:sun-line' : 'i-mingcute:moon-line'"
                        @click="toggleTheme()"
                        square
                    />
                    <UiPopover
                        mode="click"
                        :content="{
                            align: 'center',
                            side: 'top',
                        }"
                    >
                        <UiButton icon="i-mingcute:font-line" color="neutral" variant="ghost" size="sm" square />
                        <template #content>
                            <div class="flex flex-col items-center gap-2.5 px-2.5 py-3">
                                <UiIcon
                                    name="i-mingcute:add-circle-line"
                                    class="size-4 cursor-pointer text-muted hover:text-default"
                                    @click="upScale()"
                                />
                                <UiSlider
                                    v-model="scale"
                                    size="xs"
                                    color="neutral"
                                    orientation="vertical"
                                    :min="minScale"
                                    :max="maxScale"
                                    :step="stepScale"
                                    :ui="{
                                        root: 'h-18',
                                        thumb: 'size-2 cursor-pointer',
                                    }"
                                />
                                <UiIcon
                                    name="i-mingcute:minus-circle-line"
                                    class="size-4 cursor-pointer text-muted hover:text-default"
                                    @click="downScale()"
                                />
                            </div>
                        </template>
                    </UiPopover>
                    <UiButton
                        icon="i-mingcute:exit-line"
                        color="red"
                        variant="ghost"
                        size="sm"
                        :label="collapsed ? undefined : 'Sign Out'"
                        :square="collapsed"
                        :class="collapsed ? '' : 'ms-auto'"
                        @click="emit('signout')"
                    />
                </div>
            </template>
        </UiDashboardSidebar>

        <UiDashboardPanel id="default">
            <template #header>
                <UiDashboardNavbar
                    :ui="{
                        root: 'gap-3',
                        left: 'flex-1',
                    }"
                >
                    <template #left>
                        <slot name="navbar-left">
                            <div class="flex-1" />
                        </slot>
                    </template>
                    <template #right>
                        <slot name="navbar-right" />
                    </template>
                </UiDashboardNavbar>
            </template>
            <template #body>
                <slot />
            </template>
        </UiDashboardPanel>
    </UiDashboardGroup>
</template>

<script lang="ts" setup>
const props = defineProps({
    items: {
        type: Array as PropType<NavigationItem[][]>,
        required: true,
    },
});

const emit = defineEmits({
    signout: null,
});

const { scale, upScale, downScale } = useScale();

const colorMode = useColorMode();

function toggleTheme() {
    colorMode.preference = colorMode.preference === "dark" ? "light" : "dark";
}
</script>
