<template>
    <UiBadge
        :ui="{
            base: 'pl-2 pr-2.5 py-1 rounded-full select-none',
        }"
        color="neutral"
        variant="outline"
        size="xs"
    >
        <div class="flex items-center gap-1.5">
            <div :class="computedColor" class="relative flex items-center justify-center rounded-full size-2">
                <span class="rounded-full size-1 bg-default" />
            </div>
            <span class="relative text-xs capitalize top-[-0.5px]">
                <small>{{ label }}</small>
            </span>
        </div>
    </UiBadge>
</template>

<script lang="ts" setup>
const props = defineProps({
    disabled: {
        type: Boolean,
        required: true,
    },
});
const label = computed(() => {
    return props.disabled ? "Disabled" : "Active";
});

const computedColor = computed(() => {
    return props.disabled ? "bg-red-500" : "bg-green-500";
});
</script>
