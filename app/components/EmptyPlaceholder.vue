<template>
    <div class="relative size-12 flex items-center justify-center text-primary-500">
        <UiIcon
            :customize="customize"
            mode="svg"
            name="i-mingcute:border-blank-line"
            class="absolute top-0 -left-0.75 size-full opacity-25 -rotate-45 animate-jump"
        />
        <UiIcon
            :customize="customize"
            mode="svg"
            name="i-mingcute:border-blank-line"
            class="absolute top-0 left-0.75 size-full opacity-25 rotate-45 animate-jump"
        />
        <UiIcon :name="props.icon" class="size-5" />
    </div>
</template>

<script lang="ts" setup>
const props = defineProps({
    icon: {
        type: String,
        default: "i-mingcute:storage-line",
    },
});

function customize(content: string) {
    return content.replace(`stroke-width="1.5"`, `stroke-width="0.5"`);
}
</script>
