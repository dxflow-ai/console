<template>
    <div
        class="relative"
        :class="{
            'px-1': props.depth === 0,
        }"
    >
        <template v-if="props.depth > 0">
            <div
                class="absolute w-px h-full left-[--spacing(var(--tree-depth))] z-10"
                :style="{
                    '--tree-depth': props.depth * 3,
                }"
            >
                <div class="absolute w-px h-full bg-elevated left-px" />
            </div>
        </template>
        <ExplorerMenu :items="menu">
            <div
                class="flex w-full items-center gap-1.5 rounded-sm py-1.5 pr-2 pl-[--spacing(var(--tree-indent))] text-xs hover:bg-elevated cursor-pointer"
                :class="{
                    'pointer-events-none': busy,
                }"
                :style="{
                    '--tree-indent': props.depth * 3 + 2,
                }"
                @click="toggle()"
            >
                <UiIcon
                    class="size-3 shrink-0 text-muted"
                    :name="icon"
                    :class="{
                        'text-primary': isDirectory && expanded,
                        'animate-spin': spinning,
                    }"
                />
                <div class="relative flex-1">
                    <div
                        :class="{
                            'opacity-0': editing,
                        }"
                    >
                        <span class="truncate">{{ props.artifact.name }}</span>
                    </div>
                    <input
                        ref="rename-input"
                        v-model="draft"
                        class="absolute inset-0 bg-transparent outline-none"
                        autocomplete="off"
                        spellcheck="false"
                        :class="{
                            'opacity-0 pointer-events-none': !editing,
                        }"
                        :readonly="busy"
                        @keydown.esc.prevent="cancel()"
                        @keydown.enter.prevent="commit()"
                        @blur="cancel()"
                        @click.stop
                        @contextmenu.stop.prevent
                    />
                </div>
            </div>
        </ExplorerMenu>
        <template v-if="isDirectory && expanded">
            <template v-for="child in children" :key="child.identity">
                <ArtifactNode :artifact="child" :depth="props.depth + 1" @open="onOpen" />
            </template>
        </template>
    </div>
</template>

<script lang="ts" setup>
import type { ContextMenuItem } from "@nuxt/ui";
import { sleep } from "radash";

const props = defineProps({
    artifact: {
        type: Object as PropType<Artifact>,
        required: true,
    },
    depth: {
        type: Number,
        default: 0,
    },
});

const emit = defineEmits({
    open: null,
});

const { data: children } = useStoreView(artifactStore, "list", (items) => {
    return items.filter((item) => {
        return parentOf(item.identity) === props.artifact.identity;
    });
});

const { execute: executeList, loading } = useStoreAction(artifactStore, "list", {
    isolated: true,
});

const actions = useArtifactActions();

const renameInput = useTemplateRef<HTMLInputElement>("rename-input");

const fileDialog = useFileDialog({
    reset: true,
    multiple: true,
});

const confirmDelete = useConfirmToast({
    id: `artifact-delete:${props.artifact.identity}`,
    color: "red",
    title() {
        return isDirectory.value ? "Delete folder" : "Delete file";
    },
    description() {
        return `Delete '${props.artifact.name}'?`;
    },
    confirm() {
        actions.remove(props.artifact);
    },
});

const draft = ref("");
const loaded = ref(false);
const expanded = ref(false);

const isDirectory = computed(() => {
    return props.artifact.permission[0] === "d";
});

const isZip = computed(() => {
    return props.artifact.name.endsWith(".zip");
});

const editing = computed(() => {
    return actions.isRenaming(props.artifact.identity);
});

const busy = computed(() => {
    return actions.isBusy(props.artifact.identity);
});

const spinning = computed(() => {
    return loading.value || busy.value;
});

const icon = computed(() => {
    if (spinning.value) {
        return "i-mingcute:loading-3-fill";
    }

    if (isDirectory.value) {
        return "i-hugeicons:folder-01";
    }

    return fileIcon(props.artifact.name);
});

const menu = computed(() => {
    const output: ContextMenuItem[][] = [];

    if (isDirectory.value) {
        output.push([
            {
                label: "Rename",
                disabled: busy.value,
                onSelect() {
                    actions.startRename(props.artifact.identity);
                },
            },
            {
                label: "Zip",
                disabled: busy.value,
                onSelect() {
                    actions.zip(props.artifact);
                },
            },
            {
                label: "Make directory",
                disabled: busy.value,
                onSelect() {
                    onMakeDirectory();
                },
            },
            {
                label: "Upload file",
                disabled: busy.value,
                onSelect() {
                    fileDialog.open();
                },
            },
        ]);
    }

    if (!isDirectory.value) {
        output.push([
            {
                label: "Download",
                disabled: busy.value,
                onSelect() {
                    actions.download(props.artifact);
                },
            },
            {
                label: "Rename",
                disabled: busy.value,
                onSelect() {
                    actions.startRename(props.artifact.identity);
                },
            },
        ]);
    }

    if (!isDirectory.value && isZip.value) {
        output.push([
            {
                label: "Unzip",
                disabled: busy.value,
                onSelect() {
                    actions.unzip(props.artifact);
                },
            },
        ]);
    }

    output.push([
        {
            label: "Delete",
            color: "red",
            disabled: busy.value,
            onSelect() {
                confirmDelete.open();
            },
        },
    ]);

    return output;
});

watch(
    editing,
    (value) => {
        if (!value) {
            return;
        }

        draft.value = props.artifact.name;

        sleep(50).then(() => {
            renameInput.value?.focus();
            renameInput.value?.select();
        });
    },
    {
        immediate: true,
    },
);

function commit() {
    if (!editing.value) {
        return;
    }

    actions.commitRename(props.artifact, draft.value);
}

function cancel() {
    if (!editing.value) {
        return;
    }

    actions.cancelRename(props.artifact);
}

function onOpen(artifact: Artifact) {
    emit("open", artifact);
}

async function loadChildren() {
    if (!loaded.value) {
        try {
            await executeList({
                payload: {
                    directory: props.artifact.identity,
                },
            });

            loaded.value = true;
        } catch (error) {
            dangerToast("Failed to load directory", error as Error);
            return false;
        }
    }

    return true;
}

async function toggle() {
    if (!isDirectory.value) {
        if (isOpenableFile(props.artifact.name)) {
            emit("open", props.artifact);
        }

        return;
    }

    if (expanded.value) {
        expanded.value = false;

        return;
    }

    if (await loadChildren()) {
        expanded.value = true;
    }
}

async function onMakeDirectory() {
    const loaded = await loadChildren();
    if (!loaded) {
        return;
    }

    expanded.value = true;
    actions.makeDirectory(props.artifact.identity, children.value);
}

async function onUpload(files: FileList | null) {
    if (!files?.length) {
        return;
    }

    await actions.upload(props.artifact.identity, Array.from(files));

    expanded.value = true;
}

fileDialog.onChange(onUpload);
</script>
