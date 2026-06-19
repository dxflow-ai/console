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
            <div>
                <template v-if="editing">
                    <div
                        class="flex w-full items-center gap-1.5 rounded-sm py-1.5 pr-2 pl-[--spacing(var(--tree-indent))] text-xs bg-elevated ring-1 ring-primary"
                        :style="{
                            '--tree-indent': props.depth * 3 + 2,
                        }"
                    >
                        <UiIcon
                            class="size-3 shrink-0 text-muted"
                            :name="isDirectory ? 'i-hugeicons:folder-01' : fileIcon(props.artifact.name)"
                        />
                        <input
                            ref="inputEl"
                            v-model="draft"
                            class="min-w-0 flex-1 bg-transparent outline-none"
                            spellcheck="false"
                            @keydown.enter.prevent="commit()"
                            @keydown.esc.prevent="cancel()"
                            @blur="commit()"
                            @click.stop
                            @contextmenu.stop.prevent
                        />
                    </div>
                </template>
                <template v-else>
                    <button
                        type="button"
                        class="flex w-full items-center gap-1.5 rounded-sm py-1.5 pr-2 pl-[--spacing(var(--tree-indent))] text-xs hover:bg-elevated"
                        :style="{
                            '--tree-indent': props.depth * 3 + 2,
                        }"
                        @click="toggle()"
                    >
                        <template v-if="isDirectory">
                            <UiIcon
                                :name="loading ? 'i-mingcute:loading-3-fill' : 'i-hugeicons:folder-01'"
                                :class="[
                                    'size-3 shrink-0',
                                    expanded ? 'text-primary' : 'text-muted',
                                    {
                                        'animate-spin': loading,
                                    },
                                ]"
                            />
                        </template>
                        <template v-else>
                            <UiIcon class="size-3 shrink-0 text-muted" :name="fileIcon(props.artifact.name)" />
                        </template>
                        <span class="truncate">{{ props.artifact.name }}</span>
                    </button>
                </template>
            </div>
        </ExplorerMenu>
        <template v-if="isDirectory && expanded">
            <template v-for="child in children" :key="child.identity">
                <ArtifactTree :artifact="child" :depth="props.depth + 1" @open="onOpen" />
            </template>
        </template>
    </div>
</template>

<script lang="ts" setup>
import type { ContextMenuItem } from "@nuxt/ui";

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
const inputEl = ref<HTMLInputElement | null>(null);

const isDirectory = computed(() => {
    return props.artifact.permission[0] === "d";
});

const isZip = computed(() => {
    return props.artifact.name.endsWith(".zip");
});

const editing = computed(() => {
    return actions.isRenaming(props.artifact.identity);
});

const menu = computed<ContextMenuItem[][]>(() => {
    if (isDirectory.value) {
        return [
            [
                {
                    label: "Rename",
                    onSelect() {
                        actions.startRename(props.artifact.identity);
                    },
                },
                {
                    label: "Zip",
                    onSelect() {
                        actions.zip(props.artifact);
                    },
                },
                {
                    label: "Make directory",
                    onSelect() {
                        onMakeDirectory();
                    },
                },
                {
                    label: "Upload file",
                    onSelect() {
                        fileDialog.open();
                    },
                },
            ],
            [
                {
                    label: "Delete",
                    color: "red",
                    onSelect() {
                        confirmDelete.open();
                    },
                },
            ],
        ];
    }

    const fileItems: ContextMenuItem[] = [
        {
            label: "Download",
            onSelect() {
                actions.download(props.artifact);
            },
        },
        {
            label: "Rename",
            onSelect() {
                actions.startRename(props.artifact.identity);
            },
        },
    ];

    if (isZip.value) {
        fileItems.push({
            label: "Unzip",
            onSelect() {
                actions.unzip(props.artifact);
            },
        });
    }

    return [
        fileItems,
        [
            {
                label: "Delete",
                color: "red",
                onSelect() {
                    confirmDelete.open();
                },
            },
        ],
    ];
});

watch(
    editing,
    (value) => {
        if (!value) {
            return;
        }

        draft.value = props.artifact.name;

        nextTick(() => {
            const element = inputEl.value;
            if (!element) {
                return;
            }

            element.focus();

            const dot = props.artifact.name.lastIndexOf(".");
            if (!isDirectory.value && dot > 0) {
                element.setSelectionRange(0, dot);
            } else {
                element.select();
            }
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
