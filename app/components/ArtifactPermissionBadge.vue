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
                <small>{{ props.permission }}</small>
            </span>
        </div>
    </UiBadge>
</template>

<script lang="ts" setup>
const props = defineProps({
    permission: {
        type: String,
        required: true,
    },
});

const colors: Record<string, string> = {
    directory: "bg-blue-500",
    file: "bg-green-500",
    symlink: "bg-purple-500",
};
const computedColor = computed(() => {
    return colors[props.permission] ?? "bg-neutral-500";
});
</script>
