<template>
    <div class="flex h-full items-center justify-center p-4">
        <img class="max-h-full max-w-full object-contain" :src="props.source" :alt="props.alt" />
    </div>
</template>

<script lang="ts" setup>
const props = defineProps({
    source: {
        type: String,
        required: true,
    },
    alt: {
        type: String,
        default: "",
    },
});
</script>
