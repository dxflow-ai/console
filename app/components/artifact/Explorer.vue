<template>
    <div class="flex min-h-0 flex-col">
        <ExplorerHeader title="Artifacts" :expanded="props.expanded" @toggle="toggle">
            <UiButton
                icon="i-mingcute:add-circle-line"
                size="xs"
                variant="link"
                color="neutral"
                class="pr-0!"
                :loading="uploading"
                @click="fileDialog.open()"
                square
            />
        </ExplorerHeader>
        <div
            v-show="props.expanded"
            class="min-h-0 flex-1 overflow-auto py-1.5"
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
                    <ArtifactTree :artifact="child" @open="onOpen" />
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
    expanded: {
        type: Boolean,
        default: true,
    },
});

const emit = defineEmits({
    open: null,
    toggle: null,
});

const { data: nodes } = useStoreView(artifactStore, "nodes");

const fileDialog = useFileDialog({
    reset: true,
    multiple: true,
});

const { execute: executeListDir, loading } = useStoreAction(artifactStore, "listDir", { isolated: true });

const uploading = ref(false);
const dragging = ref(false);

const rootChildren = computed<Artifact[]>(() => {
    return nodes.value[props.root] ?? [];
});

function toggle() {
    emit("toggle");
}

function onOpen(artifact: Artifact) {
    emit("open", artifact);
}

async function load() {
    try {
        await executeListDir({ payload: { directory: props.root } });
    } catch (error) {
        return dangerToast("Failed to load artifacts", error as Error);
    }
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

fileDialog.onChange((files) => {
    if (files?.length) {
        uploadFiles(Array.from(files));
    }
});

onMounted(() => {
    load();
});
</script>
