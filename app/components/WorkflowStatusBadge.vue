<template>
    <UiBadge variant="soft" size="sm" class="capitalize" :color="color">
        <span>{{ props.status }}</span>
    </UiBadge>
</template>

<script lang="ts" setup>
import type { BadgeProps } from "@nuxt/ui";

const props = defineProps({
    status: {
        type: String,
        required: true,
    },
});

const colors: Record<string, BadgeProps["color"]> = {
    created: "cyan",
    started: "green",
    stopped: "amber",
    exited: "red",
};

const color = computed<BadgeProps["color"]>(() => {
    return colors[props.status] ?? "neutral";
});
</script>
