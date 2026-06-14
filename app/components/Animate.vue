<template>
    <Component :is="props.tag" ref="element">
        <slot />
    </Component>
</template>

<script lang="ts" setup>
import type { Variant, Transition, StyleProperties, TransformProperties } from "@vueuse/motion";

const props = defineProps({
    tag: {
        type: String,
        default: "div",
    },
    state: {
        type: [String, Boolean] as PropType<boolean | "enter" | "leave">,
        default: true,
    },
    initial: {
        type: Object as PropType<Variant>,
        default() {
            return {};
        },
    },
    enter: {
        type: Object as PropType<Variant>,
        default() {
            return {};
        },
    },
    leave: {
        type: Object as PropType<Variant>,
        default() {
            return {};
        },
    },
    attributes: {
        type: Object as PropType<
            Partial<Record<keyof StyleProperties | keyof TransformProperties, [initial: any, show: any, hide?: any]>>
        >,
        default() {
            return {};
        },
    },
    transition: {
        type: Object as PropType<Transition>,
        default() {
            return {};
        },
    },
    disabled: {
        type: Boolean,
        default: false,
    },
});

const element = ref<HTMLElement>();
const { variant } = useMotion(element, {
    initial: enhanceVariant("initial"),
    enter: enhanceVariant("enter"),
    leave: enhanceVariant("leave"),
});
watch(
    () => {
        return props.state;
    },
    (state) => {
        if (state === true) {
            state = "enter";
        }

        if (state === false) {
            state = "leave";
        }

        variant.value = state;
    },
    {
        immediate: true,
    },
);

function enhanceVariant(variant: "initial" | "enter" | "leave") {
    const index = {
        initial: 0,
        enter: 1,
        leave: 2,
    };

    if (props.disabled) {
        index.initial = 1;
    }

    const output = (props[variant] || {}) as Record<string, any>;
    for (const key in props.attributes) {
        if (output[key] !== undefined) {
            continue;
        }

        const value = (props.attributes as any)?.[key]?.[index[variant]] ?? (props.attributes as any)?.[key]?.[0];
        if (value !== undefined) {
            output[key] = value;
        }
    }

    if (variant === "initial") {
        return output;
    }

    if (output["transition"] === undefined) {
        output["transition"] = props.transition;
    }

    return output;
}
</script>
