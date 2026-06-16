<template>
    <div class="flex h-screen flex-col items-center justify-center gap-6 bg-muted p-4">
        <div class="flex items-center gap-2">
            <div class="flex size-9 items-center justify-center rounded-md bg-primary-900 dark:bg-primary-100">
                <BrandMark class="size-5" />
            </div>
            <span class="text-lg font-bold">dxflow</span>
        </div>
        <AuthCard class="w-full max-w-xs" />
    </div>
</template>

<script lang="ts" setup>
import { disableStandby } from "~/components/Standby.vue";

definePageMeta({
    name: "auth",
    layout: false,
});

useHead({
    title: "Sign In",
});

onBeforeUnmount(() => {
    disableStandby();
});
</script>
