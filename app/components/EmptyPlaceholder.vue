<template>
    <div class="flex flex-1 flex-col items-center justify-center gap-4">
        <UiIcon class="size-10 text-dimmed" :name="props.icon" />
        <div class="flex flex-col items-center gap-1">
            <span class="text-sm">{{ props.title }}</span>
            <template v-if="props.description">
                <span class="text-xs text-dimmed">{{ props.description }}</span>
            </template>
        </div>
    </div>
</template>

<script lang="ts" setup>
const props = defineProps({
    icon: {
        type: String,
        default: "i-mingcute:storage-line",
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: "",
    },
});
</script>
