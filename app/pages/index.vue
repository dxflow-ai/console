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

const { execute: executeSignout } = useStoreCompose(sessionStore, "signout");

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
        debounce: 250,
    },
);

function load() {
    engineStore.compose.loadAll();

    engineStore.compose.startLive(() => {
        executeSignout(false);
    });
}

function unload() {
    engineStore.compose.stopLive();
}

onMounted(() => {
    load();
});

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
