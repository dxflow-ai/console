<template>
    <ExplorerSection
        title="Artifacts"
        :expanded="props.expanded"
        :empty="!artifacts.length"
        :menu="menu"
        @toggle="toggle"
    >
        <template #actions>
            <UiButton
                icon="i-mingcute:refresh-2-line"
                size="xs"
                variant="link"
                color="neutral"
                class="pr-0!"
                :loading="loading || uploading"
                :ui="{
                    leadingIcon: 'size-3.5',
                }"
                @click="load()"
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
import type { ContextMenuItem } from "@nuxt/ui";

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

const { data: artifacts } = useStoreView(artifactStore, "list", (items) => {
    const identities = new Set(
        items.map((item) => {
            return item.identity;
        }),
    );

    return items.filter((item) => {
        return !identities.has(parentOf(item.identity));
    });
});

const { execute: executeList, loading } = useStoreAction(artifactStore, "list", {
    isolated: true,
});

const { makeDirectory, upload, uploading } = useArtifactActions();

const fileDialog = useFileDialog({
    reset: true,
    multiple: true,
});

const menu = computed<ContextMenuItem[]>(() => {
    return [
        {
            label: "Upload file",
            onSelect() {
                fileDialog.open();
            },
        },
        {
            label: "Make directory",
            onSelect() {
                makeDirectory(props.root, artifacts.value);
            },
        },
    ];
});

function toggle() {
    emit("toggle");
}

function onOpen(artifact: Artifact) {
    emit("open", artifact);
}

async function load() {
    try {
        await executeList({
            payload: {
                directory: props.root,
            },
        });
    } catch (error) {
        return dangerToast("Failed to load artifacts", error as Error);
    }
}

fileDialog.onChange((files) => {
    if (files?.length) {
        upload(props.root, Array.from(files));
    }
});

onMounted(() => {
    load();
});
</script>
