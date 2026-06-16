<template></template>

<script lang="ts" setup>
definePageMeta({
    name: "index",
});

const { authorized } = useSession();

await navigateTo({
    name: authorized.value ? "engine-overview" : "auth",
});
</script>
