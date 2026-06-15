<template>
    <div class="flex items-center justify-end" :class="props.visible ? 'opacity-100' : 'opacity-0 pointer-events-none'">
        <UiButton
            label="Remove"
            trailing-icon="i-mingcute:delete-3-line"
            size="xs"
            variant="soft"
            color="red"
            :loading="props.loading"
            @click="emit('click')"
        />
    </div>
</template>

<script lang="ts" setup>
const props = defineProps({
    visible: {
        type: Boolean,
        default: false,
    },
    loading: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits({
    click: null,
});
</script>
