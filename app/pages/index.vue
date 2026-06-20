<template>
    <div class="flex h-screen flex-col bg-default">
        <template v-if="ready">
            <ConsoleHeader />
            <ConsoleMain />
            <ConsoleFooter />
        </template>
        <AuthOverlay />
    </div>
</template>

<script lang="ts" setup>
definePageMeta({
    name: "index",
    layout: false,
});

const { styles } = useScale();
const { provided, authorized } = useSession();

const everAuthorized = ref(authorized.value);

const ready = computed(() => {
    return everAuthorized.value && provided.value;
});

watch(authorized, (value) => {
    if (value) {
        everAuthorized.value = true;
    }
});

watchDebounced(
    authorized,
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
});

useHead({
    title: "Console",
    bodyAttrs: {
        style: styles,
    },
});
</script>
