<template>
    <template v-if="animating">
        <template v-for="(characters, wordIndex) in words" :key="wordIndex">
            <span class="whitespace-nowrap">
                <template v-for="({ character, position }, _) in characters" :key="position">
                    <Animate
                        :attributes="{
                            opacity: [0, 1],
                        }"
                        :transition="{
                            duration: props.duration,
                            delay: 250 + position * props.delay,
                        }"
                        tag="span"
                        class="text-inherit"
                    >
                        <span>{{ character }}</span>
                    </Animate>
                </template>
            </span>
            <span>{{ " " }}</span>
        </template>
    </template>
    <template v-else>
        <span class="wrap-break-word text-inherit">{{ props.value }}</span>
    </template>
</template>

<script lang="ts" setup>
import Animate from "~/components/Animate.vue";

const props = defineProps({
    value: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        default: 100,
    },
    delay: {
        type: Number,
        default: 25,
    },
});

const animating = ref(false);

const words = ref(
    [] as {
        character: string;
        position: number;
    }[][],
);

watch(
    () => {
        return props.value;
    },
    (value) => {
        animate(value);
    },
    {
        immediate: true,
    },
);

async function animate(value: string) {
    if (animating.value) {
        return;
    }

    words.value = [];
    animating.value = true;

    let position = 0;
    for (const word of value.split(/\s+/)) {
        const characters = [] as {
            character: string;
            position: number;
        }[];
        for (const character of word) {
            characters.push({
                character,
                position,
            });

            position++;
        }

        words.value.push(characters);
    }

    useTimeoutFn(
        () => {
            animating.value = false;
        },
        250 + props.duration * 2 + position * props.delay,
    );
}
</script>
