<template>
    <UiPopover
        :ui="{
            content: 'p-0.5',
        }"
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
            :ui="{
                base: 'flex items-center justify-center min-w-6 min-h-6',
            }"
            square
        >
            <UiIcon :name="props.icon" class="size-3" />
        </UiButton>
        <template #content>
            <div class="relative flex flex-col min-w-22 min-h-6 gap-0.5">
                <template v-for="(item, index) in visibleItems" :key="index">
                    <UiButton
                        :color="item.color || 'neutral'"
                        :disabled="item.disabled || item.loading"
                        :ui="{
                            base: 'flex w-full h-6 items-center gap-1 !rounded-[calc(var(--ui-radius)*1.25)] disabled:opacity-50',
                        }"
                        size="xs"
                        variant="ghost"
                        @click="item.onClick"
                    >
                        <template v-if="item.icon">
                            <UiIcon :name="item.icon" class="size-3" />
                        </template>
                        <span>{{ item.label }}</span>
                        <template v-if="item.loading !== undefined">
                            <Loading :active="item.loading" />
                        </template>
                    </UiButton>
                </template>
            </div>
        </template>
    </UiPopover>
</template>

<script lang="ts" setup>
import Loading from "~/components/Loading.vue";
import type { ButtonProps } from "@nuxt/ui";

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
const visibleItems = computed(() => {
    return props.items?.filter((item) => {
        return !item.hidden;
    });
});
</script>
