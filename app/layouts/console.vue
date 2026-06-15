<template>
    <div :class="provided ? 'animate-fade' : 'opacity-0'" class="h-screen">
        <DashboardLayout
            :primary-items="primaryItems"
            :secondary-items="secondaryItems"
            :secondary-key="routeCategory"
            :mobile-items="mobileSidebarItems"
            @signout="confirmSignout.open()"
        >
            <template #header-title>
                <template v-if="loading">
                    <UiSkeleton class="h-6 w-full rounded-sm bg-primary-100/50 dark:bg-primary-950/50" />
                </template>
                <template v-else>
                    <span class="font-bold truncate">{{ engineState.attribute.host.name || "Unknown" }}</span>
                </template>
            </template>
            <template #header-badge>
                <template v-if="!loading && engineState.ping.latency">
                    <UiBadge :color="enginePingColor" class="hidden lg:flex" size="xs" variant="soft">
                        <template v-if="engineState.ping.timeout">
                            <span class="text-nowrap">Timeout</span>
                        </template>
                        <template v-else>
                            <span class="text-nowrap">{{ Math.min(engineState.ping.latency, 999) }} ms</span>
                        </template>
                    </UiBadge>
                </template>
            </template>
            <template #navbar-left>
                <div
                    class="flex w-full lg:max-w-64 items-center justify-center p-px animate-fade-up animate-duration-200 animate-delay-500"
                >
                    <div
                        class="absolute inset-0 rounded-[calc(var(--ui-radius)*1.6)] bg-neutral-100/75 dark:bg-neutral-950/5 overflow-clip"
                    >
                        <div
                            :class="{
                                'opacity-100 animate-spin': aiEffectState,
                            }"
                            class="opacity-0 absolute w-full aspect-square -translate-y-1/2 mt-4 bg-linear-to-tl from-transparent from-40% via-primary-500/50 to-60% to-transparent transition-opacity duration-500 animate-duration-2500"
                        />
                    </div>
                    <UiInput
                        :ui="{
                            root: 'w-full',
                            base: 'bg-default w-full text-xs h-8',
                        }"
                        variant="none"
                        color="neutral"
                        placeholder="Ask AI for help"
                    >
                        <template #leading>
                            <UiIcon
                                :class="{
                                    'text-primary-500 animate-pulse': aiEffectState,
                                }"
                                name="i-mingcute:magic-3-line"
                                class="size-4 transition-all duration-500 animate-duration-2500 animate-infinite"
                            />
                        </template>
                    </UiInput>
                </div>
            </template>
            <template v-if="!unauthorized">
                <slot />
            </template>
        </DashboardLayout>
    </div>
    <UiModal
        :open="unauthorized"
        :ui="{
            content: 'max-w-xs',
            header: 'hidden',
            description: 'hidden',
        }"
        title="Authentication"
        description="Sign in to access the console."
    >
        <template #content>
            <AuthCard />
        </template>
    </UiModal>
</template>

<script lang="ts" setup>
import { sleep } from "radash";
import { enableStandby, disableStandby } from "~/components/Standby.vue";

const session = useSession();
const { execute: executeSignout } = useStoreAction(sessionStore, "signout");
const route = useRoute();

const { styles } = useScale();

const aiEffect = useInterval(5000, {
    immediate: false,
    controls: true,
});

const confirmSignout = useConfirmToast({
    id: "signout-confirm",
    icon: "i-mingcute:exit-line",
    color: "neutral",
    title() {
        return "Sign Out";
    },
    description() {
        return "Are you sure you want to sign out?";
    },
    async confirm() {
        enableStandby();

        await sleep(750);
        await executeSignout();

        await sleep(250);
        disableStandby();
    },
});

const loading = ref(true);

const engineItems: NavigationItem[][] = [
    [
        {
            label: "Engine",
            type: "label",
        },
        {
            label: "Overview",
            icon: "i-mingcute:dashboard-line",
            to: "/console/engine/overview",
        },
        {
            label: "Authorized Keys",
            icon: "i-mingcute:safe-lock-line",
            disabled: true,
        },
    ],
    [
        {
            label: "Guide",
            type: "label",
        },
        {
            label: "Getting Started",
            icon: "i-mingcute:book-2-line",
            to: "https://dxflow.ai/docs/getting-started",
            external: true,
            target: "_blank",
            ui: {
                link: "text-xs",
            },
        },
        {
            label: "Advanced Topics",
            icon: "i-mingcute:book-2-line",
            to: "https://dxflow.ai/docs/advanced",
            external: true,
            target: "_blank",
            ui: {
                link: "text-xs",
            },
        },
        {
            label: "FAQs",
            icon: "i-mingcute:book-2-line",
            to: "https://dxflow.ai/docs/faqs",
            external: true,
            target: "_blank",
            ui: {
                link: "text-xs",
            },
        },
    ],
];

const workflowItems: NavigationItem[][] = [
    [
        {
            label: "Workflow",
            type: "label",
        },
        {
            label: "Workflows",
            icon: "i-mingcute:storage-line",
            to: "/console/workflow/list/",
        },
    ],
    [
        {
            label: "Guide",
            type: "label",
        },
        {
            label: "Apps & Pipelines",
            icon: "i-mingcute:book-2-line",
            to: "https://dxflow.ai/docs/interface/apps",
            external: true,
            target: "_blank",
            ui: {
                link: "text-xs",
            },
        },
    ],
];

const artifactItems: NavigationItem[][] = [
    [
        {
            label: "Artifact",
            type: "label",
        },
        {
            label: "Artifacts",
            icon: "i-mingcute:storage-line",
            to: "/console/artifact/list/",
        },
    ],
    [
        {
            label: "Guide",
            type: "label",
        },
        {
            label: "Files & Data",
            icon: "i-mingcute:book-2-line",
            to: "https://dxflow.ai/docs/interface/files",
            external: true,
            target: "_blank",
            ui: {
                link: "text-xs",
            },
        },
    ],
];

const shellItems: NavigationItem[][] = [
    [
        {
            label: "Shell",
            type: "label",
        },
        {
            label: "Sessions",
            icon: "i-mingcute:storage-line",
            to: "/console/shell/sessions/",
        },
    ],
    [
        {
            label: "Guide",
            type: "label",
        },
        {
            label: "Terminal Access",
            icon: "i-mingcute:book-2-line",
            to: "https://dxflow.ai/docs/interface/terminal",
            external: true,
            target: "_blank",
            ui: {
                link: "text-xs",
            },
        },
    ],
];

const routeItems: Record<string, NavigationItem[][]> = {
    engine: engineItems,
    workflow: workflowItems,
    artifact: artifactItems,
    shell: shellItems,
};

const provided = computed(() => {
    return session.provided.value;
});

const unauthorized = computed(() => {
    return !session.authorized.value;
});

const aiEffectState = computed(() => {
    if (!aiEffect.isActive.value || !aiEffect.counter.value) {
        return false;
    }

    if (aiEffect.counter.value % 2 !== 0) {
        return false;
    }

    return true;
});

const enginePingColor = computed(() => {
    if (engineState.ping.timeout) {
        return "red";
    }

    if (engineState.ping.latency <= 250) {
        return "green";
    }

    if (engineState.ping.latency <= 750) {
        return "cyan";
    }

    return "amber";
});

const routeCategory = computed(() => {
    if (route.path.startsWith("/console/workflow/")) {
        return "workflow";
    }

    if (route.path.startsWith("/console/artifact/")) {
        return "artifact";
    }

    if (route.path.startsWith("/console/shell/")) {
        return "shell";
    }

    return "engine";
});

const primaryItems = computed<NavigationItem[][]>(() => {
    const items: NavigationItem[] = [
        {
            label: "Engine",
            icon: "i-mingcute:box-3-line",
            to: "/console/engine/overview/",
            class: "animate-fade-down animate-duration-200 animate-delay-100",
        },
        {
            label: "Workflow",
            icon: "i-mingcute:git-branch-line",
            to: "/console/workflow/list/",
            class: "animate-fade-down animate-duration-200 animate-delay-200",
        },
        {
            label: "Artifact",
            icon: "i-mingcute:folder-2-line",
            to: "/console/artifact/list/",
            class: "animate-fade-down animate-duration-200 animate-delay-300",
        },
        {
            label: "Shell",
            icon: "i-mingcute:terminal-line",
            to: "/console/shell/sessions/",
            class: "animate-fade-down animate-duration-200 animate-delay-400",
        },
    ];

    return [items];
});

const secondaryItems = computed<NavigationItem[][]>(() => {
    return routeItems[routeCategory.value] || engineItems;
});

const mobileSidebarItems = computed<NavigationItem[][]>(() => {
    return [engineItems[0], workflowItems[0], artifactItems[0], shellItems[0]];
});

watchDebounced(
    session.authorized,
    (value) => {
        if (value) {
            load();
        } else {
            unload();
        }
    },
    {
        immediate: true,
        debounce: 250,
    },
);

async function load() {
    loading.value = true;

    try {
        await engineStore.compose.loadAll();
    } catch (error) {
        loading.value = false;
        return dangerToast("Failed to load engine", error);
    }

    loading.value = false;

    engineStore.action.startPingLive();
    aiEffect.resume();
}

function unload() {
    engineStore.action.stopPingLive();
    aiEffect.pause();
}

onUnmounted(() => {
    unload();
});

useHead({
    bodyAttrs: {
        style: styles,
    },
});
</script>
