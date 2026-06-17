<template>
    <div class="flex h-screen flex-col">
        <ConsoleHeader />

        <ConsoleMain />

        <ConsoleFooter />
    </div>
</template>

<script lang="ts" setup>
import { disableStandby } from "~/components/Standby.vue";

definePageMeta({
    name: "index",
    layout: false,
});

const session = useSession();

if (!session.authorized.value) {
    await navigateTo({
        name: "auth",
    });
}

const { styles } = useScale();

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
    try {
        await engineStore.compose.loadAll();
    } catch (error) {
        return dangerToast("Failed to load engine", error);
    }

    engineStore.action.startPingLive();
    engineStore.action.startStatLive();
}

function unload() {
    engineStore.action.stopPingLive();
    engineStore.action.stopStatLive();
}

onBeforeUnmount(() => {
    unload();

    disableStandby();
});

useHead({
    title: "Console",
    bodyAttrs: {
        style: styles,
    },
});
</script>
