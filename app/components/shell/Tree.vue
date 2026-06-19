<template>
    <div class="px-1">
        <ExplorerMenu :items="menu">
            <button
                type="button"
                class="flex w-full items-center gap-1.5 rounded-sm py-1.5 pr-2 pl-2 text-xs hover:bg-elevated"
                @click="onOpen()"
            >
                <UiIcon class="size-3 shrink-0 text-muted" name="i-hugeicons:command-line" />
                <span class="truncate">{{ props.shell.identity }}</span>
            </button>
        </ExplorerMenu>
    </div>
</template>

<script lang="ts" setup>
import type { ContextMenuItem } from "@nuxt/ui";

const props = defineProps({
    shell: {
        type: Object as PropType<Shell>,
        required: true,
    },
});

const emit = defineEmits({
    open: null,
});

const actions = useShellActions();

const confirmDelete = useConfirmToast({
    id: `shell-delete:${props.shell.identity}`,
    color: "red",
    title() {
        return "Delete shell";
    },
    description() {
        return `Delete '${props.shell.identity}'?`;
    },
    confirm() {
        actions.remove(props.shell);
    },
});

const menu = computed<ContextMenuItem[]>(() => {
    return [
        {
            label: "Delete",
            color: "red",
            onSelect() {
                confirmDelete.open();
            },
        },
    ];
});

function onOpen() {
    emit("open", props.shell);
}
</script>
