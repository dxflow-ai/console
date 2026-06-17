<template>
    <div class="flex min-h-0 flex-col">
        <div class="flex shrink-0 items-center justify-between px-3 py-2">
            <span class="text-xs font-semibold text-muted uppercase">Artifacts</span>
            <div class="flex items-center gap-0.5">
                <UiTooltip text="Upload" :delay-duration="500" :content="{ side: 'top' }">
                    <UiButton
                        icon="i-mingcute:upload-2-line"
                        size="xs"
                        variant="ghost"
                        color="neutral"
                        :loading="uploading"
                        @click="fileDialog.open()"
                        square
                    />
                </UiTooltip>
                <UiTooltip text="New Folder" :delay-duration="500" :content="{ side: 'top' }">
                    <UiButton
                        icon="i-mingcute:folder-line"
                        size="xs"
                        variant="ghost"
                        color="neutral"
                        :loading="creating"
                        @click="createFolder()"
                        square
                    />
                </UiTooltip>
            </div>
        </div>

        <div
            class="min-h-0 flex-1 overflow-auto pb-2"
            :class="{ 'bg-elevated/40': dragging }"
            @dragover.prevent="dragging = true"
            @dragleave.prevent="dragging = false"
            @drop.prevent="onDrop($event)"
        >
            <template v-if="loading && !rootChildren.length">
                <div class="px-3 py-2 text-xs text-dimmed">Loading…</div>
            </template>
            <template v-else-if="!rootChildren.length">
                <div class="px-3 py-2 text-xs text-dimmed">No artifacts</div>
            </template>
            <template v-else>
                <template v-for="child in rootChildren" :key="child.identity">
                    <ArtifactTreeNode :artifact="child" @open="emit('open', $event)" />
                </template>
            </template>
        </div>
    </div>
</template>

<script lang="ts" setup>
const props = defineProps({
    root: {
        type: String,
        default: ".",
    },
});

const emit = defineEmits({
    open: null,
});

const { data: nodes } = useStoreView(artifactStore, "nodes");

const fileDialog = useFileDialog({
    reset: true,
    multiple: true,
});

const loading = ref(false);
const uploading = ref(false);
const creating = ref(false);
const dragging = ref(false);

const rootChildren = computed<Artifact[]>(() => {
    return nodes.value[props.root] ?? [];
});

async function load() {
    loading.value = true;

    try {
        await artifactStore.action.listDir({ payload: { directory: props.root } });
    } catch (error) {
        loading.value = false;
        return dangerToast("Failed to load artifacts", error as Error);
    }

    loading.value = false;
}

async function uploadFiles(files: File[]) {
    uploading.value = true;

    let success = 0;
    for (const file of files) {
        try {
            await artifactStore.action.upload({
                payload: {
                    identity: `${props.root}/${file.name}`,
                    file,
                    force: true,
                },
            });

            success++;
        } catch (error) {
            dangerToast(`Failed to upload '${file.name}'`, error as Error);
        }
    }

    uploading.value = false;

    if (success) {
        await load();
    }
}

function onDrop(event: DragEvent) {
    dragging.value = false;

    const files = event.dataTransfer?.files;
    if (files?.length) {
        uploadFiles(Array.from(files));
    }
}

async function createFolder() {
    creating.value = true;

    try {
        await artifactStore.action.create({
            payload: {
                identity: `${props.root}/new-folder`,
                directory: true,
                force: true,
            },
        });
    } catch (error) {
        creating.value = false;
        return dangerToast("Failed to create folder", error as Error);
    }

    creating.value = false;

    await load();
}

fileDialog.onChange((files) => {
    if (files?.length) {
        uploadFiles(Array.from(files));
    }
});

onMounted(() => {
    load();
});
</script>
