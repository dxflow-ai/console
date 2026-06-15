<template>
    <HeaderLine>
        <template #tags>
            <template v-for="item in navbarItems" :key="item.label">
                <UiBadge
                    :ui="{
                        base: 'rounded-full cursor-pointer',
                    }"
                    size="sm"
                    variant="outline"
                    color="teal"
                    @click="item.onClick?.()"
                >
                    <span>{{ item.label }}</span>
                </UiBadge>
            </template>
        </template>
        <template #title>
            <span class="font-bold text-2xl text-nowrap">Artifacts</span>
        </template>
        <template #actions>
            <UiPopover
                :key="newArtifactKey"
                :ui="{
                    content: 'p-1',
                }"
                :content="{
                    side: 'left',
                    align: 'start',
                    sideOffset: 4,
                }"
            >
                <UiTooltip
                    :delay-duration="750"
                    :content="{
                        side: 'left',
                    }"
                    text="New Artifact"
                >
                    <UiButton
                        :loading="creating || uploading"
                        :ui="{
                            base: 'rounded-full',
                        }"
                        size="sm"
                        variant="outline"
                        color="neutral"
                        square
                    >
                        <template v-if="!(creating || uploading)">
                            <UiIcon name="i-mingcute:add-line" />
                        </template>
                    </UiButton>
                </UiTooltip>
                <template #content>
                    <div class="relative flex flex-col min-w-32 min-h-6 gap-0.5">
                        <UiButton
                            :loading="uploading"
                            :ui="{
                                base: 'flex w-full h-6 items-center gap-1 rounded-[calc(var(--ui-radius)*1.25)] disabled:opacity-50',
                            }"
                            size="xs"
                            variant="ghost"
                            color="neutral"
                            @click="fileDialog.open()"
                        >
                            <template v-if="!uploading">
                                <UiIcon name="i-mingcute:folder-upload-line" class="size-3" />
                            </template>
                            <span>Upload Artifacts</span>
                        </UiButton>
                        <UiButton
                            :loading="creating"
                            :ui="{
                                base: 'flex w-full h-6 items-center gap-1 rounded-[calc(var(--ui-radius)*1.25)] disabled:opacity-50',
                            }"
                            size="xs"
                            variant="ghost"
                            color="neutral"
                            @click="createDirectory()"
                        >
                            <template v-if="!creating">
                                <UiIcon name="i-mingcute:folder-line" class="size-3" />
                            </template>
                            <span>Create Directory</span>
                        </UiButton>
                    </div>
                </template>
            </UiPopover>
        </template>
        <template #options>
            <UiBadge
                :ui="{
                    base: 'rounded-full gap-1 text-nowrap',
                }"
                variant="soft"
                color="neutral"
            >
                <small class="text-muted">Total</small>
                <small class="font-bold">{{ orderedArtifacts.length }}</small>
            </UiBadge>
        </template>
    </HeaderLine>
    <UiCard
        id="element"
        :ui="{
            root: 'relative flex flex-1 flex-col rounded-none ring-0 animate-fade animate-delay-800',
            body: 'flex flex-1 h-full flex-col p-0!',
        }"
    >
        <UiTable
            v-model:row-selection="selected"
            :columns="columns"
            :data="orderedArtifacts"
            :loading="loading"
            :ui="{
                root: 'rounded-none',
                thead: 'before:absolute before:w-full before:h-px before:bottom-0 before:left-0 before:bg-accented/50',
                tbody: 'divide-none',
                th: 'bg-elevated first:rounded-tl-sm last:rounded-tr-sm',
                td: 'border-b border-b-(--ui-border)/25',
                separator: 'hidden',
                empty: 'hidden',
            }"
            sticky
        >
            <template #name-header>
                <div class="flex items-center gap-2">
                    <UiIcon name="i-mingcute:file-line" class="size-3.5" />
                    <span>Name</span>
                </div>
            </template>
            <template #name-cell="{ row }">
                <div class="flex items-center gap-2 select-none">
                    <div class="relative flex size-3.5 items-center justify-center">
                        <UiCheckbox
                            :model-value="row.getIsSelected()"
                            :ui="{
                                base: 'rounded-xs pointer-events-none',
                                icon: 'size-3',
                            }"
                            size="sm"
                        />
                        <div class="absolute -inset-2 rounded-md cursor-pointer" @click="row.toggleSelected()" />
                        <div
                            :class="editing == row.original.identity ? 'animate-fade' : 'opacity-0 pointer-events-none'"
                            class="absolute flex -inset-1 items-center justify-center bg-(--ui-bg)/0 text-emerald-500 rounded-full"
                        >
                            <UiIcon
                                :name="
                                    renaming == row.original.identity
                                        ? 'i-mingcute:loading-3-fill'
                                        : 'i-mingcute:text-2-line'
                                "
                                :class="['size-4', { 'animate-spin': renaming == row.original.identity }]"
                            />
                        </div>
                    </div>
                    <div
                        :class="{
                            'font-bold': row.original.permission[0] == 'd',
                        }"
                        class="w-full"
                    >
                        <template v-if="editing == row.original.identity">
                            <UiInput
                                v-model="renameInput"
                                :placeholder="row.original.name"
                                :disabled="editing != row.original.identity"
                                :ui="{
                                    root: 'w-full',
                                    base: 'p-0 text-(--ui-text-muted) rounded-none disabled:pointer-events-none !opacity-100',
                                }"
                                size="md"
                                variant="none"
                                @blur="rename(row.original)"
                                @focus="({ target }: any) => target.select()"
                                @keydown.enter="({ target }: any) => target.blur()"
                                @keydown.escape.prevent="releaseEdit()"
                                autofocus
                            />
                        </template>
                        <template v-else>
                            <span class="text-sm cursor-text select-text">{{ row.original.name }}</span>
                        </template>
                    </div>
                </div>
            </template>
            <template #permission-header>
                <div class="flex items-center gap-2">
                    <UiIcon name="i-mingcute:lock-line" class="size-3.5" />
                    <span>Permission</span>
                </div>
            </template>
            <template #permission-cell="{ row }">
                <ArtifactPermissionBadge :permission="row.original.permission" />
            </template>
            <template #size-header>
                <div class="flex items-center gap-2">
                    <UiIcon name="i-mingcute:storage-line" class="size-3.5" />
                    <span>Size</span>
                </div>
            </template>
            <template #size-cell="{ row }">
                <div class="text-xs opacity-75">
                    {{ prettyBytes(row.original.size) }}
                </div>
            </template>
            <template #modified_at-header>
                <div class="flex items-center gap-2">
                    <UiIcon name="i-mingcute:calendar-2-line" class="size-3.5" />
                    <span>Modified At</span>
                </div>
            </template>
            <template #modified_at-cell="{ row }">
                <div class="text-xs opacity-75">
                    <DateLabel
                        :timestamp="row.original.modified_at"
                        class="text-xs"
                        month="short"
                        day="numeric"
                        hour="numeric"
                        minute="numeric"
                    />
                </div>
            </template>
            <template #actions-header>
                <div
                    :class="selectedIdentities.length ? 'animate-fade' : 'opacity-0 pointer-events-none'"
                    class="flex items-center justify-end"
                >
                    <UiButton
                        :loading="removingBatch"
                        :ui="{
                            base: 'flex items-center justify-center gap-1.5',
                        }"
                        size="xs"
                        variant="soft"
                        color="red"
                        @click="confirmRemoveBatch.open()"
                    >
                        <span>Remove</span>
                        <template v-if="!removingBatch">
                            <UiIcon name="i-mingcute:delete-3-line" class="size-3.5" />
                        </template>
                    </UiButton>
                </div>
            </template>
            <template #actions-cell="{ row }">
                <div class="flex items-center justify-end gap-1.5">
                    <template v-if="row.original.permission[0] == 'd'">
                        <UiButton
                            :disabled="loading && directory.endsWith(row.original.name)"
                            size="xs"
                            variant="soft"
                            color="primary"
                            @click="changeDirectory(directory, row.original)"
                        >
                            <UiIcon name="i-mingcute:arrow-right-line" class="size-3.5" />
                            <span>Open</span>
                        </UiButton>
                    </template>
                    <template v-else>
                        <UiButton
                            :color="downloaded.includes(row.original.identity) ? 'green' : 'primary'"
                            :loading="downloading == row.original.identity"
                            :ui="{
                                base: 'flex items-center justify-center gap-1.5',
                            }"
                            size="xs"
                            variant="soft"
                            @click="download(row.original)"
                        >
                            <template v-if="downloaded.includes(row.original.identity)">
                                <template v-if="downloading != row.original.identity">
                                    <UiIcon name="i-mingcute:cloud-line" class="size-3.5" />
                                </template>
                                <span>Saved</span>
                            </template>
                            <template v-else>
                                <template v-if="downloading != row.original.identity">
                                    <UiIcon name="i-mingcute:download-line" class="size-3.5" />
                                </template>
                                <span>Download</span>
                            </template>
                        </UiButton>
                    </template>
                    <MoreOptions :key="moreOptionsKey" :items="getActions(row.original)" />
                </div>
            </template>
        </UiTable>
        <template v-if="empty">
            <div class="flex flex-col flex-1 items-center justify-center gap-4">
                <EmptyPlaceholder />
                <div class="flex flex-col items-center gap-1 animate-fade">
                    <span class="text-sm">No Artifacts Available</span>
                    <span class="text-xs opacity-50">Create a new directory</span>
                </div>
            </div>
        </template>
    </UiCard>
</template>

<script lang="ts" setup>
import prettyBytes from "pretty-bytes";
import { saveAs } from "file-saver";
import { sleep } from "radash";
import { useRouteQuery } from "@vueuse/router";

import type { DeepReadonly } from "vue";
import type { TableColumn } from "@nuxt/ui";

definePageMeta({
    name: "artifact-list",
    layout: "console",
});

const { data: orderedArtifacts } = useStoreView(artifactStore, "list");
const { execute: loadArtifacts, loading } = useStoreAction(artifactStore, "get");
const { execute: resetArtifacts } = useStoreAction(artifactStore, "reset");

const directory = useRouteQuery<string>("directory", ".", {
    transform(value) {
        return value || ".";
    },
});

const fileDialog = useFileDialog({
    reset: true,
    multiple: true,
});

const confirmDeleteArtifact = useConfirmToast({
    id: "artifact-delete-confirm",
    icon: "i-mingcute:delete-3-line",
    color: "red",
    title() {
        return "Delete Artifact";
    },
    description(payload: { identity: string; name: string }) {
        return `Are you sure you want to delete '${payload.name}'?`;
    },
    confirm(payload: { identity: string; name: string }) {
        deleteAction(payload);
    },
    cancel() {
        moreOptionsKey.value++;
    },
});

const confirmRemoveBatch = useConfirmToast({
    id: "artifact-remove-batch-confirm",
    icon: "i-mingcute:delete-3-line",
    color: "red",
    title() {
        return "Remove Artifacts";
    },
    description() {
        return `Are you sure you want to remove ${selectedIdentities.value.length} artifacts?`;
    },
    confirm() {
        removeBatchAction();
    },
});

const columns: TableColumn<DeepReadonly<Artifact>>[] = [
    {
        id: "name",
    },
    {
        id: "permission",
        meta: { class: { th: "w-48" } },
    },
    {
        id: "size",
        meta: { class: { th: "w-32" } },
    },
    {
        id: "modified_at",
        meta: { class: { th: "w-32" } },
    },
    {
        id: "actions",
        meta: { class: { th: "w-64" } },
    },
];

const creating = ref(false);
const uploading = ref(false);

const deleting = ref<MaybeString>();
const renaming = ref<MaybeString>();
const removingBatch = ref(false);

const renameInput = ref("");
const editing = ref<MaybeString>();

const downloading = ref<MaybeString>();
const downloaded = ref<string[]>([]);

const newArtifactKey = ref(0);
const moreOptionsKey = ref(0);

const selected = ref<Record<number, boolean>>({});

const navbarItems = computed(() => {
    const output = [
        {
            label: "Root",
            onClick() {
                changeDirectory(".");
            },
        },
    ] as {
        label: string;
        onClick?: () => void;
    }[];

    let prefix: string[] = ["."];

    const items = directory.value.split("/");
    for (const item of items) {
        if (!item || item === ".") {
            continue;
        }

        prefix.push(item);

        const path = prefix.join("/");
        output.push({
            label: item,
            onClick() {
                changeDirectory(path);
            },
        });
    }

    return output;
});

const selectedIdentities = computed(() => {
    const identities: string[] = [];
    for (const index in selected.value) {
        if (selected.value[index] && orderedArtifacts.value[index]?.identity) {
            identities.push(orderedArtifacts.value[index].identity);
        }
    }

    return identities;
});

const empty = computed(() => {
    return !orderedArtifacts.value.length && !loading.value;
});

watch(orderedArtifacts, () => {
    selected.value = {};
});

function edit({ identity, name }: Pick<Artifact, "identity" | "name">) {
    editing.value = identity;

    renameInput.value = name;
}

function releaseEdit() {
    editing.value = null;
}

async function rename({ identity, name }: Pick<Artifact, "identity" | "name">) {
    renaming.value = identity;

    const newIdentity = identity.slice(0, name.length * -1) + renameInput.value;
    if (identity !== newIdentity) {
        try {
            await artifactStore.action.renameById({ payload: { identity, new_identity: newIdentity } });
        } catch (error) {
            dangerToast(`Failed to rename '${name}'`, error as Error);
        }
    }

    renaming.value = null;
    releaseEdit();
}

function getActions(artifact: DeepReadonly<Artifact>): any {
    return [
        {
            label: "Rename",
            icon: "i-mingcute:edit-2-line",
            loading: renaming.value === artifact.identity,
            onClick() {
                edit(artifact);
            },
        },
        {
            label: "Delete",
            icon: "i-mingcute:delete-3-line",
            color: "red",
            loading: deleting.value === artifact.identity,
            onClick() {
                confirmDeleteArtifact.open(artifact);
            },
        },
    ];
}

async function load(changingDirectory?: boolean) {
    if (changingDirectory) {
        await resetArtifacts();
    }

    await loadArtifacts();
}

async function createDirectory() {
    creating.value = true;
    newArtifactKey.value++;

    try {
        const artifact = await artifactStore.action.create({
            payload: {
                identity: `${directory.value}/.directory`,
                directory: true,
                force: true,
            },
        });

        creating.value = false;

        if (artifact) {
            edit(artifact);
        }
    } catch (error) {
        creating.value = false;
        dangerToast("Failed to create directory", error as Error);
    }
}

async function deleteAction({ identity, name }: Pick<DeepReadonly<Artifact>, "identity" | "name">) {
    deleting.value = identity;

    try {
        await artifactStore.action.removeById({ payload: { identity } });
    } catch (error) {
        dangerToast(`Failed to delete '${name}'`, error as Error);
    }

    deleting.value = null;
    moreOptionsKey.value++;
}

async function removeBatchAction() {
    removingBatch.value = true;

    try {
        await artifactStore.action.removeBatch({ payload: { identities: selectedIdentities.value } });
    } catch (error) {
        dangerToast("Failed to remove batch", error as Error);
    }

    removingBatch.value = false;
}

async function download({ identity, name }: Artifact) {
    downloading.value = identity;

    try {
        const result = await artifactStore.action.downloadById({ payload: { identity } });

        await sleep(750);
        downloading.value = null;

        if (result) {
            saveAs(result.blob, result.name);

            await sleep(750);
            downloaded.value.push(identity);
        }
    } catch (error) {
        await sleep(750);
        downloading.value = null;
        dangerToast(`Failed to download '${name}'`, error as Error);
    }
}

async function changeDirectory(
    prefix: string,
    { name, permission }: Pick<Artifact, "name" | "permission"> = {} as any,
) {
    if (loading.value) {
        return;
    }

    const path = [];
    if (prefix) {
        path.push(prefix);
    }

    if (name && permission) {
        if (permission[0] != "d") {
            return;
        }

        if (name) {
            path.push(name);
        }
    }

    directory.value = path.join("/");

    load(true);
}

fileDialog.onChange(async (files) => {
    if (!files?.length) {
        return;
    }

    uploading.value = true;
    newArtifactKey.value++;

    let successCount = 0;
    for (const file of files) {
        try {
            await artifactStore.action.upload({
                payload: {
                    identity: `${directory.value}/${file.name}`,
                    file: file as File,
                    force: true,
                },
            });

            successCount++;
        } catch (error) {
            dangerToast(`Failed to upload '${file.name}'`, error as Error);
        }
    }

    uploading.value = false;

    if (successCount > 0) {
        await load();
    }
});

useHead({
    title: "Artifacts",
});

onMounted(() => {
    load();
});
</script>
