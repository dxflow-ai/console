<template>
    <div>
        <button
            type="button"
            class="flex w-full items-center gap-1 rounded-sm py-1 pr-2 text-sm hover:bg-elevated"
            :style="{ paddingLeft: `${props.depth * 12 + 8}px` }"
            @click="toggle()"
        >
            <template v-if="isDirectory">
                <UiIcon
                    :name="
                        loading
                            ? 'i-mingcute:loading-3-fill'
                            : expanded
                              ? 'i-mingcute:down-small-fill'
                              : 'i-mingcute:right-small-fill'
                    "
                    :class="['size-4 shrink-0 text-muted', { 'animate-spin': loading }]"
                />
                <UiIcon
                    class="size-4 shrink-0 text-primary"
                    :name="expanded ? 'i-mingcute:folder-open-fill' : 'i-mingcute:folder-fill'"
                />
            </template>
            <template v-else>
                <span class="size-4 shrink-0" />
                <UiIcon name="i-mingcute:file-fill" class="size-4 shrink-0 text-muted" />
            </template>
            <span class="truncate">{{ props.artifact.name }}</span>
        </button>

        <template v-if="isDirectory && expanded">
            <template v-for="child in children" :key="child.identity">
                <ArtifactTreeNode :artifact="child" :depth="props.depth + 1" @open="emit('open', $event)" />
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

const expanded = ref(false);
const loading = ref(false);

const isDirectory = computed(() => {
    return props.artifact.permission[0] === "d";
});

const children = computed<Artifact[]>(() => {
    return nodes.value[props.artifact.identity] ?? [];
});

async function toggle() {
    if (!isDirectory.value) {
        emit("open", props.artifact);
        return;
    }

    if (expanded.value) {
        expanded.value = false;
        return;
    }

    if (!nodes.value[props.artifact.identity]) {
        loading.value = true;

        try {
            await artifactStore.action.listDir({ payload: { directory: props.artifact.identity } });
        } catch (error) {
            loading.value = false;
            return dangerToast("Failed to load directory", error as Error);
        }

        loading.value = false;
    }

    expanded.value = true;
}
</script>
