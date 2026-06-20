<template>
    <div class="px-1">
        <ContextMenu :items="menu">
            <div
                class="flex w-full items-center gap-1.5 rounded-sm py-1.5 pr-2 pl-2 text-xs hover:bg-elevated"
                :class="{
                    'pointer-events-none': busy,
                }"
                @click="onOpen()"
            >
                <UiIcon
                    class="size-3 shrink-0 text-muted"
                    :class="{
                        'animate-spin': busy,
                    }"
                    :name="busy ? 'i-mingcute:loading-3-fill' : 'i-hugeicons:command-line'"
                />
                <span class="truncate">{{ props.shell.identity }}</span>
            </div>
        </ContextMenu>
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

const busy = computed(() => {
    return actions.isBusy(props.shell.identity);
});

const menu = computed(() => {
    const output: ContextMenuItem[] = [
        {
            label: "Delete",
            color: "red",
            disabled: busy.value,
            onSelect() {
                actions.remove(props.shell);
            },
        },
    ];

    return output;
});

function onOpen() {
    emit("open", props.shell);
}
</script>
