<template>
    <ExplorerSection
        title="Artifacts"
        empty-label="No artifacts"
        :expanded="props.expanded"
        :loading="loading"
        :empty="!artifacts.length"
        @toggle="toggle"
    >
        <template #actions>
            <UiButton
                icon="i-mingcute:add-circle-fill"
                size="xs"
                variant="link"
                color="neutral"
                class="pr-0!"
                :loading="uploading"
                :ui="{
                    leadingIcon: 'size-3.5',
                }"
                @click="fileDialog.open()"
                square
            />
        </template>
        <template #empty>
            <ExplorerEmpty
                icon="i-hugeicons:file-01"
                description="Files generated or uploaded here"
                :title="loading ? 'Loading artifacts' : 'No artifacts yet'"
                :loading="loading"
            />
        </template>
        <template v-for="child in artifacts" :key="child.identity">
            <ArtifactTree :artifact="child" @open="onOpen" />
        </template>
    </ExplorerSection>
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

const { execute: executeListDir, loading } = useStoreAction(artifactStore, "listDir", {
    isolated: true,
});

const uploading = ref(false);

const artifacts = computed<Artifact[]>(() => {
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
        await executeListDir({
            payload: {
                directory: props.root,
            },
        });
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

fileDialog.onChange((files) => {
    if (files?.length) {
        uploadFiles(Array.from(files));
    }
});

onMounted(() => {
    load();
});
</script>
