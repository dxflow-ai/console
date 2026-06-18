<template>
    <ExplorerSection
        title="Shell"
        empty-label="No shells"
        :expanded="props.expanded"
        :loading="loading"
        :empty="!shells.length"
        @toggle="toggle"
    >
        <template #actions>
            <UiButton
                icon="i-mingcute:add-circle-line"
                size="xs"
                variant="link"
                color="neutral"
                class="pr-0!"
                :loading="creating"
                @click="createShell()"
                square
            />
        </template>
        <template v-for="shell in shells" :key="shell.identity">
            <ShellTree :shell="shell" @open="onOpen" />
        </template>
    </ExplorerSection>
</template>

<script lang="ts" setup>
const props = defineProps({
    expanded: {
        type: Boolean,
        default: true,
    },
});

const emit = defineEmits({
    open: null,
    toggle: null,
});

const { data: shells } = useStoreView(shellStore, "list");

const { execute: executeGet, loading } = useStoreAction(shellStore, "get", { isolated: true });
const { execute: executeCreate, loading: creating } = useStoreAction(shellStore, "create", { isolated: true });

function toggle() {
    emit("toggle");
}

function onOpen(shell: Shell) {
    emit("open", shell);
}

async function load() {
    try {
        await executeGet();
    } catch (error) {
        return dangerToast("Failed to load shells", error as Error);
    }
}

async function createShell() {
    try {
        const shell = await executeCreate();

        if (shell) {
            onOpen(shell);
        }
    } catch (error) {
        dangerToast("Failed to create shell", error as Error);
    }
}

onMounted(() => {
    load();
});
</script>
