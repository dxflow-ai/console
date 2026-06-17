<template>
    <span class="size-2 shrink-0 rounded-full" :class="statusColor(props.status)" />
</template>

<script lang="ts" setup>
const props = defineProps({
    status: {
        type: String,
        default: "",
    },
});
</script>
