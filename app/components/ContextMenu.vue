<template>
    <template v-if="props.items?.length">
        <UiContextMenu
            :items="props.items"
            :ui="{
                content: 'min-w-0',
                item: 'px-2 py-1 text-xs',
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
