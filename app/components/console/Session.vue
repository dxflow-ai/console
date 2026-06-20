<template>
    <UiButton label="Sign Out" size="xs" variant="link" color="neutral" class="pr-0!" @click="signout()" square />
</template>

<script lang="ts" setup>
const { signout } = useSessionActions();
</script>
