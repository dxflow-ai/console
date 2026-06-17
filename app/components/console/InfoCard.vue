<template>
    <div class="overflow-hidden rounded border border-default">
        <div class="border-b border-default bg-elevated/40 px-2.5 py-1">
            <span class="text-xs font-semibold text-muted uppercase">{{ props.title }}</span>
        </div>

        <div class="flex flex-col px-2.5 py-1">
            <slot />
        </div>
    </div>
</template>

<script lang="ts" setup>
const props = defineProps({
    title: {
        type: String,
        required: true,
    },
});
</script>
