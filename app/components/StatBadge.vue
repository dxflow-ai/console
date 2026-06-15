<template>
    <UiBadge
        variant="soft"
        color="neutral"
        :ui="{
            base: 'gap-1 text-nowrap',
        }"
    >
        <small class="text-muted">{{ props.label }}</small>
        <small class="font-bold">
            <slot>{{ props.value }}</slot>
        </small>
    </UiBadge>
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
});
</script>
