<template>
    <div class="px-1">
        <button
            type="button"
            class="flex w-full items-center gap-1.5 rounded-sm py-1.5 pr-2 pl-2 text-xs hover:bg-elevated"
            @click="onOpen()"
        >
            <UiIcon name="i-hugeicons:command-line" class="size-3 shrink-0 text-muted" />
            <span class="truncate">{{ props.shell.identity }}</span>
        </button>
    </div>
</template>

<script lang="ts" setup>
const props = defineProps({
    shell: {
        type: Object as PropType<Shell>,
        required: true,
    },
});

const emit = defineEmits({
    open: null,
});

function onOpen() {
    emit("open", props.shell);
}
</script>
