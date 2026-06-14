<template>
    <NuxtTime
        :datetime="correctedTimestamp"
        :weekday="weekday"
        :year="year"
        :month="month"
        :day="day"
        :hour="hour"
        :minute="minute"
        :second="second"
    />
</template>

<script lang="ts" setup>
import { isNumber, isString } from "radash";

const props = defineProps({
    timestamp: {
        type: [Number, String],
        default() {
            return Date.now();
        },
    },
    weekday: {
        type: String as PropType<"long" | "short" | "narrow">,
        default: undefined,
    },
    year: {
        type: String as PropType<"numeric" | "2-digit">,
        default: undefined,
    },
    month: {
        type: String as PropType<"numeric" | "2-digit" | "long" | "short" | "narrow">,
        default: undefined,
    },
    day: {
        type: String as PropType<"numeric" | "2-digit">,
        default: undefined,
    },
    hour: {
        type: String as PropType<"numeric" | "2-digit">,
        default: undefined,
    },
    minute: {
        type: String as PropType<"numeric" | "2-digit">,
        default: undefined,
    },
    second: {
        type: String as PropType<"numeric" | "2-digit">,
        default: undefined,
    },
});
const correctedTimestamp = computed(() => {
    if (isNumber(props.timestamp)) {
        if (props.timestamp < 10_000_000_000) {
            return props.timestamp * 1000;
        }

        return props.timestamp;
    }

    if (isString(props.timestamp)) {
        const cleanedString = props.timestamp.replace(/(\+\d{4})\s+\+\d{4}/, "$1");
        const parsedDate = new Date(cleanedString);
        if (!isNaN(parsedDate.getTime())) {
            return parsedDate.toISOString();
        }
    }

    return props.timestamp;
});
</script>
