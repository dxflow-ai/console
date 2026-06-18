<template>
    <div class="flex min-h-0 flex-col">
        <ExplorerHeader :title="props.title" :expanded="props.expanded" @toggle="emit('toggle')">
            <slot name="actions" />
        </ExplorerHeader>
        <div v-show="props.expanded" class="min-h-0 flex-1 overflow-auto py-1.5">
            <template v-if="props.loading && props.empty">
                <div class="px-3 py-2 text-xs text-dimmed">Loading…</div>
            </template>
            <template v-else-if="props.empty">
                <div class="px-3 py-2 text-xs text-dimmed">{{ props.emptyLabel }}</div>
            </template>
            <template v-else>
                <slot />
            </template>
        </div>
    </div>
</template>

<script lang="ts" setup>
const props = defineProps({
    title: {
        type: String,
        required: true,
    },
    expanded: {
        type: Boolean,
        default: true,
    },
    loading: {
        type: Boolean,
        default: false,
    },
    empty: {
        type: Boolean,
        default: false,
    },
    emptyLabel: {
        type: String,
        default: "No items",
    },
});

const emit = defineEmits({
    toggle: null,
});
</script>
