<template>
    <UiApp
        :tooltip="{
            delayDuration: 250,
        }"
        :toaster="{
            position: 'bottom-right',
            duration: 7500,
            expand: false,
            progress: false,
        }"
    >
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
        <Standby />
    </UiApp>
</template>
