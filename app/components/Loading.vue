<template>
    <template v-if="props.active">
        <div class="absolute inset-0 pointer-events-none flex items-center justify-center text-xs text-dimmed">
            <UiIcon name="i-mingcute:loading-3-fill" class="size-4 animate-spin" />
        </div>
    </template>
</template>

<script lang="ts" setup>
const props = defineProps({
    active: {
        type: Boolean,
        default: false,
    },
});
</script>
