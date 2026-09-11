<template>
    <UiApp
        :toaster="{
            position: 'bottom-right',
            duration: 5000,
            progress: false,
            expand: false,
        }"
    >
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </UiApp>
</template>

<script lang="ts" setup>
const { styles } = useScale();

useEventListener(document, "contextmenu", (event) => {
    const target = event.target as HTMLElement | null;
    if (!target?.closest("input, textarea, .xterm")) {
        event.preventDefault();
    }
});

useHead({
    htmlAttrs: {
        style: styles,
    },
});
</script>
