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
        <template v-if="isDirectory && expanded">
            <template v-for="child in children" :key="child.identity">
                <ArtifactTree :artifact="child" :depth="props.depth + 1" @open="onOpen" />
            </template>
        </template>
    </div>
</template>

<script lang="ts" setup>
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

const { data: nodes } = useStoreView(artifactStore, "nodes");

const { execute: executeListDir, loading } = useStoreAction(artifactStore, "listDir", { isolated: true });

const expanded = ref(false);

const isDirectory = computed(() => {
    return props.artifact.permission[0] === "d";
});

const children = computed<Artifact[]>(() => {
    return nodes.value[props.artifact.identity] ?? [];
});

function onOpen(artifact: Artifact) {
    emit("open", artifact);
}

async function toggle() {
    if (!isDirectory.value) {
        // Only image and text files can be opened in the viewer.
        if (isOpenableFile(props.artifact.name)) {
            emit("open", props.artifact);
        }

        return;
    }

    if (expanded.value) {
        expanded.value = false;
        return;
    }

    if (!nodes.value[props.artifact.identity]) {
        try {
            await executeListDir({ payload: { directory: props.artifact.identity } });
        } catch (error) {
            return dangerToast("Failed to load directory", error as Error);
        }
    }

    expanded.value = true;
}
</script>
