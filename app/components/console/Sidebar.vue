<template>
    <aside
        class="relative flex w-64 shrink-0 flex-col bg-default border-r border-default"
        :class="{
            'fixed! inset-0 top-9 bottom-8 w-full my-[-0.5px] z-50': isMobile,
        }"
    >
        <WorkflowExplorer :expanded="workflowExpanded" @open="onOpenWorkflow" @toggle="toggleWorkflow()" first />
        <ArtifactExplorer :expanded="artifactExpanded" @open="onOpenArtifact" @toggle="toggleArtifact()" />
        <template v-if="!isMobile">
            <ShellExplorer :expanded="shellExpanded" @open="onOpenShell" @toggle="toggleShell()" last />
        </template>
    </aside>
</template>

<script lang="ts" setup>
const { isMobile, closeSidebar } = useWorkspace();
const { expanded, toggle } = useExplorer();
const { openWorkflow, openArtifact, openShell } = useTabs();

const workflowExpanded = computed(() => {
    return expanded.value.has("workflow");
});

const artifactExpanded = computed(() => {
    return expanded.value.has("artifact");
});

const shellExpanded = computed(() => {
    return expanded.value.has("shell");
});

const availableKeys = computed<ExplorerKey[]>(() => {
    return isMobile.value ? ["workflow", "artifact"] : ["workflow", "artifact", "shell"];
});

function onOpenWorkflow(payload: { workflow: Workflow }) {
    openWorkflow(payload);

    if (isMobile.value) {
        closeSidebar();
    }
}

function onOpenArtifact(payload: { artifact: Artifact }) {
    openArtifact(payload);

    if (isMobile.value) {
        closeSidebar();
    }
}

function onOpenShell(payload: { shell: Shell }) {
    openShell(payload);

    if (isMobile.value) {
        closeSidebar();
    }
}

function toggleWorkflow() {
    toggle("workflow", availableKeys.value);
}

function toggleArtifact() {
    toggle("artifact", availableKeys.value);
}

function toggleShell() {
    toggle("shell", availableKeys.value);
}
</script>
