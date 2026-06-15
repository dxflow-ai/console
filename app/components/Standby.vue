<template>
    <template v-if="active">
        <Teleport to="body">
            <div
                class="fixed flex items-center justify-center inset-0 z-50 bg-default animate-fade-up animate-duration-250"
            >
                <UiCard
                    :ui="{
                        body: 'flex flex-col items-center justify-center gap-4 !py-10',
                    }"
                    variant="subtle"
                    class="w-full max-w-xs"
                >
                    <UiIcon name="i-mingcute:sandglass-line" class="size-10 text-primary-500 animate-pulse" />
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
