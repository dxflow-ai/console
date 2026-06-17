<template>
    <div class="flex min-h-0 flex-1 flex-col">
        <div class="flex h-9 shrink-0 items-center gap-2 border-b border-default px-3 text-xs text-muted">
            <UiIcon name="i-mingcute:file-fill" class="size-4" />
            <span class="truncate">{{ props.artifact.identity }}</span>
        </div>

        <div class="min-h-0 flex-1 overflow-auto">
            <template v-if="loading">
                <div class="flex h-full items-center justify-center text-xs text-dimmed">
                    <UiIcon name="i-mingcute:loading-3-fill" class="size-4 animate-spin" />
                </div>
            </template>
            <template v-else-if="imageUrl">
                <div class="flex h-full items-center justify-center p-4">
                    <img class="max-h-full max-w-full object-contain" :src="imageUrl" :alt="props.artifact.identity" />
                </div>
            </template>
            <template v-else>
                <pre class="p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">{{ text }}</pre>
            </template>
        </div>
    </div>
</template>

<script lang="ts" setup>
const props = defineProps({
    artifact: {
        type: Object as PropType<Artifact>,
        required: true,
    },
});

const imageExtensions = ["png", "jpg", "jpeg", "gif", "svg", "webp", "bmp", "ico"];

const loading = ref(true);
const text = ref<MaybeString>();
const imageUrl = ref<MaybeString>();

const isImage = computed(() => {
    const extension = props.artifact.name.split(".").pop()?.toLowerCase() ?? "";

    return imageExtensions.includes(extension);
});

function release() {
    if (imageUrl.value) {
        URL.revokeObjectURL(imageUrl.value);
        imageUrl.value = null;
    }
}

async function load() {
    loading.value = true;
    release();
    text.value = null;

    try {
        const result = await artifactStore.action.downloadById({ payload: { identity: props.artifact.identity } });

        if (result) {
            if (isImage.value) {
                imageUrl.value = URL.createObjectURL(result.blob);
            } else {
                text.value = await result.blob.text();
            }
        }
    } catch (error) {
        dangerToast(`Failed to open '${props.artifact.name}'`, error as Error);
    }

    loading.value = false;
}

onMounted(() => {
    load();
});

onBeforeUnmount(() => {
    release();
});
</script>
