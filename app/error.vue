<template>
    <UiApp>
        <div class="flex min-h-screen items-center justify-center bg-default p-4">
            <div
                class="relative flex w-full max-w-80 flex-col gap-4 overflow-hidden rounded-lg border border-default bg-default p-4"
            >
                <div
                    class="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-red-500/60 to-transparent"
                />
                <div
                    class="pointer-events-none absolute -top-20 left-1/2 h-40 w-80 -translate-x-1/2 rounded-full bg-red-500/10 blur-[80px]"
                />
                <div class="relative flex flex-col items-center gap-3 text-center">
                    <span class="font-mono text-3xl font-semibold tracking-tight text-highlighted">
                        {{ statusCode || "!" }}
                    </span>
                    <div class="flex min-w-0 flex-col gap-1.5">
                        <span class="text-sm font-semibold tracking-tight text-highlighted">
                            {{ statusMessage }}
                        </span>
                        <span
                            class="max-h-28 overflow-y-auto text-xs wrap-break-word whitespace-pre-wrap text-muted select-text"
                        >
                            {{ message }}
                        </span>
                    </div>
                </div>
                <div class="relative rounded-lg bg-muted/50 p-3">
                    <div class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
                        <span class="text-dimmed">Engine</span>
                        <span class="truncate text-end font-mono text-muted">{{ engine }}</span>
                        <span class="text-dimmed">Session</span>
                        <span class="truncate text-end font-mono text-muted">{{ session }}</span>
                        <span class="text-dimmed">When</span>
                        <span class="truncate text-end font-mono text-muted">{{ time }}</span>
                    </div>
                </div>
                <div class="relative flex flex-col gap-2">
                    <UiButton size="sm" label="Back to console" @click="back()" block autofocus />
                    <UiButton size="sm" variant="ghost" color="neutral" label="Reload" @click="reload()" block />
                </div>
            </div>
        </div>
    </UiApp>
</template>

<script lang="ts" setup>
import type { NuxtError } from "#app";

const props = defineProps({
    error: {
        type: Object as PropType<NuxtError>,
        required: true,
    },
});

const { styles } = useScale();
const { provided, expiration, authorized } = useSession();
const { reachable, pending, probed } = useEngineChallenge();

const time = new Date().toLocaleTimeString();

const statusCode = computed(() => {
    return props.error.statusCode || 0;
});

const statusMessage = computed(() => {
    if (!statusCode.value) {
        return "Application Error";
    }

    return httpStatus[statusCode.value] || "Unknown Error";
});

const message = computed(() => {
    return props.error.message || "An error occurred";
});

const engine = computed(() => {
    if (pending.value || !probed.value) {
        return "checking";
    }

    return reachable.value ? "reachable" : "unreachable";
});

const session = computed(() => {
    if (authorized.value) {
        return "active";
    }

    if (provided.value) {
        return `expired ${new Date(expiration.value).toLocaleTimeString()}`;
    }

    return "none";
});

function back() {
    clearError({ redirect: "/" });
}

function reload() {
    window.location.reload();
}

useHead({
    bodyAttrs: {
        style: styles,
    },
});
</script>
