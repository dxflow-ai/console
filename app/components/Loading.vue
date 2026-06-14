<template>
    <div
        :class="{
            'opacity-100': props.active,
        }"
        :style="{
            '--overlay-bg': computedBg,
        }"
        class="absolute inset-0 bg-(--overlay-bg) rounded-[inherit] opacity-0 transition-opacity duration-300 pointer-events-none"
    />
    <div
        :class="{
            'opacity-100': props.active,
        }"
        class="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 pointer-events-none"
    >
        <template v-if="props.active">
            <div
                :style="{
                    '--overlay-size': computedSize,
                }"
                class="relative flex items-center justify-center min-h-8 min-w-8 size-(--overlay-size)"
            >
                <UiIcon :="computedIcon" />
            </div>
        </template>
    </div>
</template>

<script lang="ts" setup>
import type { IconProps } from "@nuxt/ui";

const props = defineProps({
    active: {
        type: Boolean,
        default: false,
    },
    bg: {
        type: Array as PropType<string[]>,
        default() {
            return ["var(--ui-bg) 40%", "currentcolor 15%"];
        },
    },
    size: {
        type: Number,
        default: 4,
    },
    weight: {
        type: Number,
        default: 3,
    },
    transparent: {
        type: Boolean,
        default: false,
    },
});
const computedBg = computed(() => {
    if (props.transparent) {
        return "transparent";
    }

    return `color-mix(in oklab, ${props.bg[0] || "transparent"}, ${props.bg[1] || "transparent"})`;
});

const computedSize = computed(() => {
    return `calc(var(--spacing) * ${props.size})`;
});

const computedIcon = computed(() => {
    const base: { class: string } & IconProps = {
        class: "size-(--overlay-size)",
        name: "i-custom:loading",
    };
    if (props.weight != 3) {
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator?.userAgent);
        if (!isSafari) {
            base["mode"] = "svg";

            base["customize"] = (content: string) => {
                return content.replace(`stroke-width="3"`, `stroke-width="${props.weight}"`);
            };
        }
    }

    return base;
});
</script>
