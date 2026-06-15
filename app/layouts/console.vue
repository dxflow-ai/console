<template>
    <div class="h-screen">
        <DashboardLayout :items="navigationItems" @signout="confirmSignout.open()">
            <template #header-title>
                <template v-if="loading">
                    <UiSkeleton class="h-5 w-full rounded-sm" />
                </template>
                <template v-else>
                    <span class="block truncate text-sm font-bold">
                        {{ engineState.attribute.host.name || "Unknown" }}
                    </span>
                </template>
            </template>
            <template #header-badge>
                <template v-if="!loading && engineState.ping.latency">
                    <UiBadge size="sm" variant="soft" :color="enginePingColor">
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
                <UiInput
                    icon="i-mingcute:search-2-line"
                    color="neutral"
                    variant="outline"
                    size="sm"
                    placeholder="Search or ask AI for help"
                    :ui="{
                        root: 'w-full max-w-sm',
                    }"
                />
            </template>
            <slot />
        </DashboardLayout>
    </div>
</template>

<script lang="ts" setup>
import { sleep } from "radash";
import { enableStandby, disableStandby } from "~/components/Standby.vue";

const session = useSession();
const { execute: executeSignout } = useStoreAction(sessionStore, "signout");

const { styles } = useScale();

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
        await navigateTo({ name: "auth" });
    },
});

const loading = ref(true);

const navigationItems = computed<NavigationItem[][]>(() => {
    return [
        [
            {
                label: "Engine",
                icon: "i-mingcute:box-3-line",
                to: "/engine/overview/",
            },
            {
                label: "Workflows",
                icon: "i-mingcute:git-branch-line",
                to: "/workflow/list/",
            },
            {
                label: "Artifacts",
                icon: "i-mingcute:folder-2-line",
                to: "/artifact/list/",
            },
            {
                label: "Shell",
                icon: "i-mingcute:terminal-line",
                to: "/shell/sessions/",
            },
        ],
    ];
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
}

function unload() {
    engineStore.action.stopPingLive();
}

onBeforeUnmount(() => {
    unload();

    disableStandby();
});

useHead({
    bodyAttrs: {
        style: styles,
    },
});
</script>
