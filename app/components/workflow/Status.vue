<template>
    <span class="size-2 shrink-0 rounded-full" :class="color" />
</template>

<script lang="ts" setup>
const props = defineProps({
    status: {
        type: String,
        default: "",
    },
});

const colors: Record<string, string> = {
    started: "bg-green-500",
    running: "bg-green-500",
    executed: "bg-green-500",
    created: "bg-blue-500",
    pending: "bg-neutral-500",
    exited: "bg-neutral-500",
    stopped: "bg-yellow-500",
    killed: "bg-yellow-500",
    failed: "bg-red-500",
};

const color = computed(() => {
    return colors[props.status] ?? "bg-neutral-500";
});
</script>
