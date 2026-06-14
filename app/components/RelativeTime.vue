<template>
    <NuxtTime :datetime="correctedTimestamp" relative />
</template>

<script lang="ts" setup>
const props = defineProps({
    timestamp: {
        type: Number,
        default() {
            return Date.now();
        },
    },
});
const correctedTimestamp = computed(() => {
    if (props.timestamp < 10_000_000_000) {
        return props.timestamp * 1000;
    }

    return props.timestamp;
});
</script>
