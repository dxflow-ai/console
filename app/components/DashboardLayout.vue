<template>
    <div class="fixed inset-0 bg-neutral-100/50 dark:bg-neutral-950/25">
        <UiDashboardGroup>
            <UiDashboardSidebar
                id="primary"
                :toggle="false"
                :ui="{
                    root: '!border-0',
                    footer: 'mb-2.5',
                }"
                collapsed
            >
                <template #header>
                    <UiButton
                        :ui="{
                            base: 'size-8 bg-primary-900 dark:bg-primary-100 rounded-full pointer-events-none',
                        }"
                        class="animate-fade-down animate-duration-200"
                        square
                    >
                        <UiIcon
                            mode="svg"
                            name="i-custom-mark"
                            class="relative -top-px size-4.5 [&>path]:fill-default animate-rotate-x"
                        />
                    </UiButton>
                </template>
                <UiNavigationMenu
                    :items="primaryItems"
                    :tooltip="{
                        delayDuration: 750,
                        content: {
                            sideOffset: 0,
                        },
                    }"
                    :ui="{
                        list: 'flex flex-col gap-2',
                        link: 'before:max-w-8 before:rounded-full before:aspect-square hover:before:bg-transparent data-active:before:bg-inverted/5',
                    }"
                    orientation="vertical"
                    collapsed
                >
                    <template #item="{ item }">
                        <UiIcon :name="item.icon" class="size-5.5" />
                    </template>
                </UiNavigationMenu>
                <template #footer>
                    <UiNavigationMenu
                        :items="footerItems"
                        :ui="{
                            list: 'flex flex-col gap-2',
                        }"
                        orientation="vertical"
                        collapsed
                    >
                        <template #theme>
                            <UiButton
                                :ui="{
                                    base: 'p-0',
                                }"
                                size="xs"
                                variant="link"
                                color="neutral"
                            >
                                <template v-if="colorMode.preference === 'dark'">
                                    <UiIcon name="i-mingcute:sun-line" class="size-4.5 dark:text-yellow-400" />
                                </template>
                                <template v-else>
                                    <UiIcon name="i-mingcute:moon-line" class="size-4.5 text-blue-400" />
                                </template>
                            </UiButton>
                        </template>
                        <template #scale>
                            <UiPopover
                                :content="{
                                    align: 'center',
                                    side: 'top',
                                }"
                                :ui="{
                                    content: 'px-2.5 py-1 shadow-sm rounded-sm text-xs',
                                }"
                                mode="click"
                                arrow
                            >
                                <UiButton
                                    :ui="{
                                        base: 'p-0',
                                    }"
                                    size="xs"
                                    variant="link"
                                    color="neutral"
                                >
                                    <UiIcon name="i-mingcute:font-line" class="size-4.5" />
                                </UiButton>
                                <template #content>
                                    <div class="flex items-center">
                                        <div class="flex flex-col items-center gap-2.5 py-2">
                                            <UiIcon
                                                name="i-mingcute:add-circle-line"
                                                class="size-4 cursor-pointer"
                                                @click="upScale()"
                                            />
                                            <UiSlider
                                                v-model="scale"
                                                :min="minScale"
                                                :max="maxScale"
                                                :step="stepScale"
                                                :ui="{
                                                    root: 'h-18',
                                                    thumb: 'size-2 cursor-pointer',
                                                }"
                                                size="xs"
                                                color="neutral"
                                                orientation="vertical"
                                            />
                                            <UiIcon
                                                name="i-mingcute:minus-circle-line"
                                                class="size-4 cursor-pointer"
                                                @click="downScale()"
                                            />
                                        </div>
                                    </div>
                                </template>
                            </UiPopover>
                        </template>
                    </UiNavigationMenu>
                </template>
            </UiDashboardSidebar>
            <UiDashboardSidebar
                id="secondary"
                :toggle="false"
                :ui="{
                    root: '!border-0',
                    body: 'lg:mb-5',
                }"
            >
                <template #header>
                    <div
                        class="flex text-base flex-1 max-w-28 animate-fade-right animate-duration-200 animate-delay-200"
                    >
                        <slot name="header-title" />
                    </div>
                    <slot name="header-badge" />
                </template>
                <UiNavigationMenu
                    :key="secondaryKey"
                    :ui="{
                        list: 'flex flex-col gap-1',
                        item: 'animate-fade-down animate-duration-200 animate-delay-100',
                        label: 'px-0',
                        link: 'px-0',
                        linkLeadingIcon: 'size-4',
                        separator: 'hidden',
                    }"
                    :items="secondaryItems"
                    :external-icon="false"
                    orientation="vertical"
                    variant="link"
                />
            </UiDashboardSidebar>
            <UiDashboardPanel
                id="primary"
                :ui="{
                    body: 'bg-default text-base rounded-lg py-3 px-3 sm:px-5 sm:py-5 mb-4 mx-4 sm:mx-6 lg:mb-4 lg:mr-4 lg:ml-0 !gap-0 ring-1 ring-neutral-100/75 dark:ring-neutral-950/5 overflow-x-hidden animate-fade animate-duration-400 animate-delay-400',
                }"
            >
                <template #header>
                    <UiDashboardNavbar
                        :ui="{
                            root: '!border-0 lg:pl-0 lg:pr-4 gap-3',
                            left: 'flex-1 gap-3',
                        }"
                    >
                        <template #toggle>
                            <UiButton
                                :ui="{
                                    base: 'size-8 bg-primary-900 dark:bg-primary-100 rounded-full',
                                }"
                                class="lg:hidden animate-fade-down animate-duration-200"
                                @click="toggleMobileSidebar()"
                                square
                            >
                                <UiIcon
                                    :key="mobileSidebar ? 'on' : 'off'"
                                    mode="svg"
                                    name="i-custom-mark"
                                    class="relative -top-px size-4.5 [&>path]:fill-default animate-rotate-x"
                                />
                            </UiButton>
                        </template>
                        <template #left>
                            <slot name="navbar-left">
                                <div class="flex-1" />
                            </slot>
                        </template>
                        <template #right>
                            <slot name="navbar-right" />
                            <UiButton
                                size="xs"
                                variant="soft"
                                color="red"
                                class="hidden lg:flex animate-fade-down animate-duration-200 animate-delay-600"
                                @click="emit('signout')"
                            >
                                <span>Sign Out</span>
                                <UiIcon name="i-mingcute:exit-line" class="size-3.5" />
                            </UiButton>
                            <UiButton
                                size="md"
                                variant="soft"
                                color="red"
                                class="flex lg:hidden rounded-full animate-fade-left animate-duration-200 animate-delay-600"
                                @click="emit('signout')"
                                square
                            >
                                <UiIcon name="i-mingcute:exit-line" class="size-5" />
                            </UiButton>
                        </template>
                    </UiDashboardNavbar>
                </template>
                <template #body>
                    <slot />
                </template>
            </UiDashboardPanel>
        </UiDashboardGroup>
    </div>
    <UiDrawer v-model:open="mobileSidebar">
        <template #content>
            <UiNavigationMenu
                :ui="{
                    list: 'flex flex-col gap-1 mb-4',
                    label: 'px-4',
                    link: 'px-4',
                    linkLeadingIcon: 'size-4',
                    separator: 'hidden',
                }"
                :items="mobileItems"
                orientation="vertical"
                variant="link"
            />
        </template>
    </UiDrawer>
</template>

<script lang="ts" setup>
const props = defineProps({
    primaryItems: {
        type: Array as PropType<NavigationItem[][]>,
        required: true,
    },
    secondaryItems: {
        type: Array as PropType<NavigationItem[][]>,
        required: true,
    },
    secondaryKey: {
        type: String,
        default: "default",
    },
    mobileItems: {
        type: Array as PropType<NavigationItem[][]>,
        required: true,
    },
});

const emit = defineEmits({
    signout: null,
});

const { scale, upScale, downScale } = useScale();

const route = useRoute();
const colorMode = useColorMode();

const mobileSidebar = ref(false);

const footerItems: NavigationItem[][] = [
    [
        {
            slot: "scale",
            class: "animate-fade-up animate-duration-200 animate-delay-400",
            ui: {
                link: "before:hidden",
            },
        },
        {
            slot: "theme",
            class: "animate-fade-up animate-duration-200 animate-delay-500",
            ui: {
                link: "before:hidden",
            },
            onSelect() {
                colorMode.preference = colorMode.preference === "dark" ? "light" : "dark";
            },
        },
    ],
];

function toggleMobileSidebar() {
    mobileSidebar.value = !mobileSidebar.value;

    watchOnce(route, () => {
        mobileSidebar.value = false;
    });
}
</script>
