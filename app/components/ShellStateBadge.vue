<template>
    <UiBadge variant="soft" size="sm" class="capitalize" :color="color">
        <span>{{ props.state }}</span>
    </UiBadge>
</template>

<script lang="ts" setup>
import type { BadgeProps } from "@nuxt/ui";

const props = defineProps({
    state: {
        type: String,
        required: true,
    },
});

const colors: Record<string, BadgeProps["color"]> = {
    created: "cyan",
    executed: "green",
    failed: "red",
    killed: "amber",
    exited: "blue",
};

const color = computed<BadgeProps["color"]>(() => {
    return colors[props.state] ?? "neutral";
});
</script>
