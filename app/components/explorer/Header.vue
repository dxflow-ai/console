<template>
    <div class="relative flex h-8 shrink-0 items-center justify-between bg-muted/40 px-3">
        <div
            class="absolute inset-[-0.5px] border-default pointer-events-none"
            :class="{
                'border-t': !props.first || props.expanded,
                'border-b': !props.last || props.expanded,
            }"
        />
        <button type="button" class="flex min-w-0 flex-1 items-center gap-1 text-left" @click="toggle()">
            <div class="size-2 flex items-center">
                <UiIcon
                    class="-ml-1 size-4 shrink-0"
                    :name="props.expanded ? 'i-mingcute:down-small-fill' : 'i-mingcute:right-small-fill'"
                />
            </div>
            <span class="text-xs font-semibold text-muted capitalize">{{ props.title }}</span>
        </button>
        <div
            class="flex items-center gap-0.5"
            :class="{
                'opacity-0': !props.expanded,
            }"
        >
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
    expanded: {
        type: Boolean,
        default: true,
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
    toggle() {
        return true;
    },
});

function toggle() {
    emit("toggle");
}
</script>
