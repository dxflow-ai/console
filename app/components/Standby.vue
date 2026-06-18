<template>
    <template v-if="active">
        <Teleport to="body">
            <Transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="opacity-0"
                enter-to-class="opacity-100"
                appear
            >
                <div class="fixed inset-0 z-50 flex items-center justify-center bg-default p-4">
                    <Transition
                        enter-active-class="transition delay-75 duration-200 ease-out"
                        enter-from-class="scale-95 opacity-0"
                        enter-to-class="scale-100 opacity-100"
                        appear
                    >
                        <div class="flex w-full max-w-xs flex-col overflow-hidden rounded-md border border-default">
                            <div class="flex items-center gap-2.5 border-b border-default bg-elevated/40 px-4 py-3">
                                <div class="flex size-9 shrink-0 items-center justify-center rounded bg-elevated">
                                    <BrandMark class="size-5" />
                                </div>
                                <div class="flex flex-col">
                                    <span class="font-semibold text-default">dxflow</span>
                                    <span class="text-xs text-muted -mt-1.5">Console</span>
                                </div>
                            </div>
                            <div class="flex flex-col gap-0.5 p-4">
                                <div class="flex items-center gap-2">
                                    <UiIcon
                                        name="i-mingcute:loading-3-fill"
                                        class="size-4 shrink-0 animate-spin text-muted"
                                    />
                                    <span class="font-semibold text-default">Just a moment</span>
                                </div>
                                <span class="text-xs text-muted">Hang tight while we finish up.</span>
                            </div>
                        </div>
                    </Transition>
                </div>
            </Transition>
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
