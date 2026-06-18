<template>
    <div class="flex bg-muted/25 flex-col" :class="props.expanded ? 'min-h-0 flex-1' : 'shrink-0'">
        <ExplorerHeader
            :title="props.title"
            :expanded="props.expanded"
            :first="props.first"
            :last="props.last"
            @toggle="toggle()"
        >
            <slot name="actions" />
        </ExplorerHeader>
        <div v-show="props.expanded" class="min-h-0 flex-1 overflow-auto py-1.5">
            <template v-if="props.empty">
                <slot name="empty" />
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
    first: {
        type: Boolean,
        default: false,
    },
    last: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits({
    toggle: null,
});

function toggle() {
    emit("toggle");
}
</script>
