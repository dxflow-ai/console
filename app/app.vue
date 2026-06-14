<template>
    <UiApp
        :tooltip="{
            delayDuration: 250,
        }"
        :toaster="{
            position: 'bottom-center',
            duration: 7500,
            expand: false,
            progress: false,
        }"
    >
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </UiApp>
</template>
