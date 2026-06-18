<template>
    <div
        class="flex h-8 shrink-0 items-center justify-between bg-muted/50 border-b border-default px-3"
        :class="{
            'border-b-0': !props.expanded,
        }"
    >
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
});

const emit = defineEmits({
    toggle: null,
});

function toggle() {
    emit("toggle");
}
</script>
