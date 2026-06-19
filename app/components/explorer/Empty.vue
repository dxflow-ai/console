<template>
    <div class="flex h-full flex-col items-center justify-center gap-2 px-4 py-6 text-center text-xs">
        <div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-elevated">
            <UiIcon
                class="size-4 text-muted"
                :name="props.loading ? 'i-mingcute:loading-3-fill' : props.icon"
                :class="{
                    'animate-spin': props.loading,
                }"
            />
        </div>
        <div class="flex flex-col gap-0.5">
            <span class="font-semibold text-default">{{ props.title }}</span>
            <span class="text-muted">{{ props.description }}</span>
        </div>
    </div>
</template>

<script lang="ts" setup>
const props = defineProps({
    icon: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    loading: {
        type: Boolean,
        default: false,
    },
});
</script>
