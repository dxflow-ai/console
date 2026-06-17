<template>
    <div class="flex items-center justify-between gap-3 py-0.5">
        <span class="shrink-0 text-muted">{{ props.label }}</span>
        <span class="truncate text-default" :class="{ 'font-mono': props.mono }">
            <slot>{{ props.value }}</slot>
        </span>
    </div>
</template>

<script lang="ts" setup>
const props = defineProps({
    label: {
        type: String,
        required: true,
    },
    value: {
        type: [String, Number],
        default: "",
    },
    mono: {
        type: Boolean,
        default: false,
    },
});
</script>
