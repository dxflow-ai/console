<template>
    <template v-if="props.items?.length">
        <UiContextMenu
            size="xs"
            :items="props.items"
            :ui="{
                content: 'min-w-0',
                group: 'p-0.5',
                item: 'px-1.5 py-0.75 text-xs',
            }"
        >
            <slot />
        </UiContextMenu>
    </template>
    <template v-else>
        <slot />
    </template>
</template>

<script lang="ts" setup>
import type { ContextMenuItem } from "@nuxt/ui";

const props = defineProps({
    items: {
        type: Array as PropType<ContextMenuItem[] | ContextMenuItem[][]>,
        default() {
            return [] as any;
        },
    },
});
</script>
