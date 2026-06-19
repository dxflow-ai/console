<template>
    <div class="relative flex h-full min-h-0 flex-1 flex-col">
        <div
            class="min-h-0 flex-1 overflow-auto"
            :class="{
                'opacity-0': loading,
            }"
        >
            <template v-if="view === 'media'">
                <ArtifactMedia :source="imageUrl" :alt="props.artifact.identity" />
            </template>
            <template v-else-if="view === 'editor'">
                <ArtifactEditor v-model="draft" :name="props.artifact.name" :readonly="saving" @save="save" />
            </template>
        </div>
        <Loading :active="loading" />
    </div>
</template>

<script lang="ts" setup>
const props = defineProps({
    artifact: {
        type: Object as PropType<Artifact>,
        required: true,
    },
});

const { execute: executeDownload, loading } = useStoreAction(artifactStore, "downloadById", {
    isolated: true,
});

const { execute: executeUpload, loading: saving } = useStoreAction(artifactStore, "upload", {
    isolated: true,
});

const text = ref("");
const draft = ref("");
const imageUrl = ref<MaybeString>();

const view = computed(() => {
    return isImageFile(props.artifact.name) ? "media" : "editor";
});

const dirty = computed(() => {
    return draft.value !== text.value;
});

function release() {
    if (imageUrl.value) {
        URL.revokeObjectURL(imageUrl.value);
        imageUrl.value = null;
    }
}

async function load() {
    release();

    text.value = "";
    draft.value = "";

    try {
        const result = await executeDownload({
            payload: {
                identity: props.artifact.identity,
            },
        });

        if (result) {
            if (view.value === "media") {
                imageUrl.value = URL.createObjectURL(result.blob);
            } else {
                text.value = await result.blob.text();
                draft.value = text.value;
            }
        }
    } catch (error) {
        dangerToast(`Failed to open '${props.artifact.name}'`, error as Error);
    }
}

async function save() {
    if (!dirty.value) {
        return;
    }

    try {
        const file = new File([draft.value], props.artifact.name, {
            type: "text/plain",
        });

        await executeUpload({
            payload: {
                identity: props.artifact.identity,
                file,
                force: true,
            },
        });

        text.value = draft.value;
    } catch (error) {
        dangerToast(`Failed to save '${props.artifact.name}'`, error as Error);
    }
}

onMounted(() => {
    load();
});

onBeforeUnmount(() => {
    release();
});
</script>
