<template>
    <div class="shrink-0 p-2">
        <AgentTools />
        <div class="rounded-lg bg-elevated/75 p-2">
            <UiTextarea
                v-model="draft"
                class="w-full"
                variant="none"
                placeholder="Tell me what you want to build or run."
                :rows="3"
                :maxrows="8"
                :disabled="busy"
                :ui="{
                    base: 'p-1 text-xs resize-none',
                }"
                @keydown="onKeydown"
                autoresize
            />
            <div
                class="mt-1.5 flex items-center justify-between gap-2 border-t border-muted/50 px-1 pt-1.5 text-dimmed"
            >
                <div class="flex items-center gap-2 text-xs">
                    <span class="flex items-center gap-0.5">
                        <UiIcon class="size-2.5 shrink-0" name="i-mingcute:arrow-up-line" />
                        <span>{{ compact(usage.input) }}</span>
                    </span>
                    <span class="flex items-center gap-0.5">
                        <UiIcon class="size-2.5 shrink-0" name="i-mingcute:arrow-down-line" />
                        <span>{{ compact(usage.output) }}</span>
                    </span>
                </div>
                <div class="flex items-center gap-1 text-xs">
                    <template v-if="busy">
                        <span>Working</span>
                        <UiIcon class="size-3 shrink-0 animate-spin" name="i-mingcute:loading-3-fill" />
                    </template>
                    <template v-else>
                        <span>Enter to send</span>
                        <UiIcon class="size-3 shrink-0" name="i-mingcute:corner-down-left-line" />
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
const { draft, busy, usage } = useAgent();
const { send } = useAgentActions();

function compact(value: number) {
    if (value >= 1_000_000) {
        return `${+(value / 1_000_000).toFixed(1)}m`;
    }

    if (value >= 1_000) {
        return `${+(value / 1_000).toFixed(1)}k`;
    }

    return `${value}`;
}

function onKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();

        send(draft.value);
    }
}
</script>
