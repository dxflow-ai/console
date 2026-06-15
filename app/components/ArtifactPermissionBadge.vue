<template>
    <UiBadge variant="soft" size="sm" class="capitalize" :color="color">
        <span>{{ props.permission }}</span>
    </UiBadge>
</template>

<script lang="ts" setup>
import type { BadgeProps } from "@nuxt/ui";

const props = defineProps({
    permission: {
        type: String,
        required: true,
    },
});

const colors: Record<string, BadgeProps["color"]> = {
    directory: "blue",
    file: "green",
    symlink: "indigo",
};

const color = computed<BadgeProps["color"]>(() => {
    return colors[props.permission] ?? "neutral";
});
</script>
