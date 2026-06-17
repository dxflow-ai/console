<template>
    <div class="flex h-screen items-center justify-center bg-default p-4">
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
