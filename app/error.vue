<template>
    <UiMain>
        <UiError
            :redirect="redirect"
            :error="{
                statusCode,
                statusMessage,
            }"
            :clear="{
                size: 'sm',
                variant: 'soft',
                label: 'Back',
            }"
        >
            <template #message>
                <span>{{ message }}</span>
            </template>
        </UiError>
    </UiMain>
</template>

<script setup lang="ts">
type ErrorProps = {
    statusCode?: number;
    message?: string;
};

const props = defineProps({
    error: {
        type: Object as PropType<ErrorProps>,
        required: true,
    },
});

const route = useRoute();

const statusCode = computed(() => {
    return props.error?.statusCode || 0;
});

const statusMessage = computed(() => {
    return httpStatus[statusCode.value] || "Unknown";
});

const message = computed(() => {
    return props.error?.message || "An error occurred";
});

const redirect = computed(() => {
    if (route.path.startsWith("/docs")) {
        return "/docs";
    }

    return "/";
});
</script>
