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
                :loading="loading || creating || creatingDirectory"
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
            >
                <template #action>
                    <UiButton
                        label="New Artifact"
                        size="xs"
                        variant="link"
                        color="neutral"
                        class="underline"
                        :loading="creating"
                        :disabled="loading || creatingDirectory"
                        @click="fileDialog.open()"
                    />
                </template>
            </ExplorerEmpty>
        </template>
        <template v-for="child in artifacts" :key="child.identity">
            <ArtifactNode :artifact="child" @open="onOpen" />
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
    open(payload: { artifact: Artifact }) {
        return true;
    },
    toggle() {
        return true;
    },
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

const { createDirectory, create, creating, creatingDirectory } = useArtifactActions();

const fileDialog = useArtifactFileDialog();

const menu = computed(() => {
    const output: ContextMenuItem[] = [
        {
            label: "New Artifact",
            onSelect() {
                fileDialog.open();
            },
        },
        {
            label: "New directory",
            onSelect() {
                createDirectory(props.root, artifacts.value);
            },
        },
    ];

    return output;
});

function toggle() {
    emit("toggle");
}

function onOpen(payload: { artifact: Artifact }) {
    emit("open", payload);
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
        create(props.root, Array.from(files));
    }
});

onMounted(() => {
    load();
});
</script>
