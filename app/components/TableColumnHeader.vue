<template>
    <div class="flex items-center gap-2">
        <UiIcon class="size-3.5" :name="props.icon" />
        <span>{{ props.label }}</span>
    </div>
</template>

<script lang="ts" setup>
const props = defineProps({
    icon: {
        type: String,
        required: true,
    },
    label: {
        type: String,
        required: true,
    },
});
</script>
