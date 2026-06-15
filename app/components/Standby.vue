<template>
    <template v-if="active">
        <Teleport to="body">
            <div class="fixed inset-0 z-50 flex items-center justify-center bg-default">
                <UiCard
                    variant="subtle"
                    class="w-full max-w-xs"
                    :ui="{
                        body: 'flex flex-col items-center justify-center gap-4 py-10',
                    }"
                >
                    <UiIcon name="i-mingcute:sandglass-line" class="size-10 text-primary animate-pulse" />
                    <div class="flex flex-col items-center gap-1">
                        <span class="text-lg font-bold">Just a moment</span>
                        <span class="text-sm text-muted">Hang tight while we finish up</span>
                    </div>
                </UiCard>
            </div>
        </Teleport>
    </template>
</template>

<script lang="ts">
const visible = ref(false);

export function enableStandby() {
    visible.value = true;
}

export function disableStandby() {
    visible.value = false;
}
</script>

<script lang="ts" setup>
const active = computed(() => {
    return visible.value;
});
</script>
