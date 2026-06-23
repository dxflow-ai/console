<template>
    <template v-if="current">
        <div class="flex items-center gap-1.5 text-nowrap">
            <UiIcon name="i-mingcute:loading-3-fill" class="size-3.5 shrink-0 animate-spin" />
            <span class="max-w-64 truncate">{{ current.message }}</span>
        </div>
    </template>
</template>

<script lang="ts" setup>
const { current } = useActivity();
</script>
