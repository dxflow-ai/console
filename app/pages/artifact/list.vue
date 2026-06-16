<template>
    <HeaderLine>
        <template #tags>
            <template v-for="item in navbarItems" :key="item.label">
                <UiBadge
                    size="sm"
                    variant="outline"
                    color="teal"
                    :ui="{
                        base: 'cursor-pointer',
                    }"
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
            <UiDropdownMenu
                :key="newArtifactKey"
                :items="newArtifactItems"
                :content="{
                    side: 'left',
                    align: 'start',
                    sideOffset: 4,
                }"
                arrow
            >
                <UiTooltip
                    text="New Artifact"
                    :delay-duration="750"
                    :content="{
                        side: 'left',
                    }"
                >
                    <UiButton
                        icon="i-mingcute:add-line"
                        size="sm"
                        variant="outline"
                        color="neutral"
                        :loading="creating || uploading"
                        square
                    />
                </UiTooltip>
            </UiDropdownMenu>
        </template>
        <template #options>
            <StatBadge label="Total" :value="orderedArtifacts.length" />
        </template>
    </HeaderLine>
    <UiCard
        id="element"
        :ui="{
            root: 'flex flex-1 flex-col',
            body: 'flex flex-1 h-full flex-col p-0!',
        }"
    >
        <UiTable
            v-model:row-selection="selected"
            :columns="columns"
            :data="orderedArtifacts"
            :loading="loading"
            :ui="{
                empty: 'hidden',
            }"
            sticky
        >
            <template #name-header>
                <TableColumnHeader icon="i-mingcute:file-line" label="Name" />
            </template>
            <template #name-cell="{ row }">
                <div class="flex items-center gap-2 select-none">
                    <TableRowSelect :selected="row.getIsSelected()" @toggle="row.toggleSelected()">
                        <div
                            class="absolute flex -inset-1 items-center justify-center bg-(--ui-bg)/0 text-emerald-500 rounded-full"
                            :class="editing == row.original.identity ? 'opacity-100' : 'opacity-0 pointer-events-none'"
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
                    </TableRowSelect>
                    <div
                        class="w-full"
                        :class="{
                            'font-bold': row.original.permission[0] == 'd',
                        }"
                    >
                        <template v-if="editing == row.original.identity">
                            <UiInput
                                v-model="renameInput"
                                size="md"
                                variant="none"
                                :placeholder="row.original.name"
                                :disabled="editing != row.original.identity"
                                :ui="{
                                    root: 'w-full',
                                    base: 'p-0 text-(--ui-text-muted) rounded-none disabled:pointer-events-none !opacity-100',
                                }"
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
                <TableColumnHeader icon="i-mingcute:lock-line" label="Permission" />
            </template>
            <template #permission-cell="{ row }">
                <ArtifactPermissionBadge :permission="row.original.permission" />
            </template>
            <template #size-header>
                <TableColumnHeader icon="i-mingcute:storage-line" label="Size" />
            </template>
            <template #size-cell="{ row }">
                <div class="text-xs text-muted">
                    <span>{{ prettyBytes(row.original.size) }}</span>
                </div>
            </template>
            <template #modified_at-header>
                <TableColumnHeader icon="i-mingcute:calendar-2-line" label="Modified At" />
            </template>
            <template #modified_at-cell="{ row }">
                <div class="text-xs text-muted">
                    <DateLabel
                        class="text-xs"
                        month="short"
                        day="numeric"
                        hour="numeric"
                        minute="numeric"
                        :timestamp="row.original.modified_at"
                    />
                </div>
            </template>
            <template #actions-header>
                <TableRemoveAction
                    :visible="!!selectedIdentities.length"
                    :loading="removingBatch"
                    @click="confirmRemoveBatch.open()"
                />
            </template>
            <template #actions-cell="{ row }">
                <div class="flex items-center justify-end gap-1.5">
                    <template v-if="row.original.permission[0] == 'd'">
                        <UiButton
                            label="Open"
                            leading-icon="i-mingcute:arrow-right-line"
                            size="xs"
                            variant="soft"
                            color="primary"
                            :disabled="loading && directory.endsWith(row.original.name)"
                            @click="changeDirectory(directory, row.original)"
                        />
                    </template>
                    <template v-else>
                        <UiButton
                            size="xs"
                            variant="soft"
                            :loading="downloading == row.original.identity"
                            :color="downloaded.includes(row.original.identity) ? 'green' : 'primary'"
                            :label="downloaded.includes(row.original.identity) ? 'Saved' : 'Download'"
                            :icon="
                                downloaded.includes(row.original.identity)
                                    ? 'i-mingcute:cloud-line'
                                    : 'i-mingcute:download-line'
                            "
                            @click="download(row.original)"
                        />
                    </template>
                    <MoreOptions :key="moreOptionsKey" :items="getActions(row.original)" />
                </div>
            </template>
        </UiTable>
        <template v-if="empty">
            <EmptyPlaceholder title="No Artifacts Available" description="Create a new directory" />
        </template>
    </UiCard>
</template>

<script lang="ts" setup>
import prettyBytes from "pretty-bytes";
import { saveAs } from "file-saver";
import { sleep } from "radash";
import { useRouteQuery } from "@vueuse/router";

import type { DeepReadonly } from "vue";
import type { DropdownMenuItem, TableColumn } from "@nuxt/ui";

definePageMeta({
    name: "artifact-list",
    layout: "console",
    middleware: "guard",
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

const newArtifactItems = computed<DropdownMenuItem[]>(() => {
    return [
        {
            label: "Upload Artifacts",
            icon: "i-mingcute:folder-upload-line",
            loading: uploading.value,
            disabled: uploading.value,
            onSelect() {
                fileDialog.open();
            },
        },
        {
            label: "Create Directory",
            icon: "i-mingcute:folder-line",
            loading: creating.value,
            disabled: creating.value,
            onSelect() {
                createDirectory();
            },
        },
    ];
});

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
