<template>
    <div class="relative flex size-3.5 items-center justify-center">
        <UiCheckbox
            size="sm"
            :model-value="props.selected"
            :ui="{
                base: 'rounded-xs pointer-events-none',
                icon: 'size-3',
            }"
        />
        <div class="absolute -inset-2 rounded-md cursor-pointer" @click="emit('toggle')" />
        <slot />
    </div>
</template>

<script lang="ts" setup>
const props = defineProps({
    selected: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits({
    toggle: null,
});
</script>
