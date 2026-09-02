<template>
    <div class="flex flex-col">
        <div
            class="flex h-8 shrink-0 items-center justify-between gap-3 bg-muted/50 px-3 cursor-pointer"
            :class="[props.expanded && 'border-b border-default', !props.first && 'border-t border-default']"
            @click="toggle()"
        >
            <div class="flex min-w-0 flex-1 items-center gap-1">
                <div class="flex size-2 items-center">
                    <UiIcon
                        class="-ml-1 size-4 shrink-0"
                        :name="props.expanded ? 'i-mingcute:down-small-fill' : 'i-mingcute:right-small-fill'"
                    />
                </div>
                <span class="truncate text-xs font-semibold text-muted">{{ props.title }}</span>
            </div>
            <UiIcon class="size-3.5 shrink-0 text-dimmed" :name="props.icon" />
        </div>
        <template v-if="props.expanded">
            <div class="h-72 p-3">
                <slot />
            </div>
        </template>
    </div>
</template>

<script lang="ts" setup>
const props = defineProps({
    title: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
        required: true,
    },
    expanded: {
        type: Boolean,
        default: false,
    },
    first: {
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
