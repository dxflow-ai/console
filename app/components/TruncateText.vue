<template>
    <UiTooltip
        :text="props.value"
        :delay-duration="1250"
        :disabled="props.value == truncatedValue"
        :content="{
            side: 'top',
            align: 'start',
        }"
    >
        <span>{{ truncatedValue }}</span>
    </UiTooltip>
</template>

<script lang="ts" setup>
const props = defineProps({
    value: {
        type: String,
        required: true,
    },
    start: {
        type: Number,
        default: 24,
    },
    end: {
        type: Number,
        default: 32,
    },
});

const truncatedValue = computed(() => {
    return truncate(props.value, props.start, props.end);
});
</script>
