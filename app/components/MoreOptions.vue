<template>
    <UiDropdownMenu
        :items="menuItems"
        :content="{
            side: 'bottom',
            align: 'end',
            sideOffset: 4,
        }"
        arrow
    >
        <UiButton
            :size="props.size"
            :variant="props.variant"
            :color="props.color"
            :disabled="props.disabled"
            :icon="props.icon"
            square
        />
    </UiDropdownMenu>
</template>

<script lang="ts" setup>
import type { ButtonProps, DropdownMenuItem } from "@nuxt/ui";

const props = defineProps({
    size: {
        type: String as PropType<ButtonProps["size"]>,
        default: "xs",
    },
    variant: {
        type: String as PropType<ButtonProps["variant"]>,
        default: "soft",
    },
    color: {
        type: String as PropType<ButtonProps["color"]>,
        default: "neutral",
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    icon: {
        type: String,
        default: "i-mingcute:more-2-line",
    },
    items: {
        type: Array as PropType<
            {
                label: string;
                icon?: string;
                color?: ButtonProps["color"];
                loading?: boolean;
                disabled?: boolean;
                hidden?: boolean;
                onClick?: () => void;
            }[]
        >,
    },
});

const menuItems = computed<DropdownMenuItem[]>(() => {
    return (props.items ?? [])
        .filter((item) => {
            return !item.hidden;
        })
        .map((item) => {
            return {
                label: item.label,
                icon: item.icon,
                color: item.color as DropdownMenuItem["color"],
                loading: item.loading,
                disabled: item.disabled || item.loading,
                onSelect() {
                    item.onClick?.();
                },
            };
        });
});
</script>
