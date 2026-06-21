<template>
    <aside class="flex w-64 shrink-0 flex-col border-r border-default">
        <WorkflowExplorer :expanded="workflowExpanded" @open="openWorkflow" @toggle="toggleWorkflow()" first />
        <ArtifactExplorer :expanded="artifactExpanded" @open="openArtifact" @toggle="toggleArtifact()" />
        <ShellExplorer :expanded="shellExpanded" @open="openShell" @toggle="toggleShell()" last />
    </aside>
</template>

<script lang="ts" setup>
const { openWorkflow, openArtifact, openShell } = useTabs();
const { expanded, toggle } = useExplorer();

const workflowExpanded = computed(() => {
    return expanded.value.has("workflow");
});

const artifactExpanded = computed(() => {
    return expanded.value.has("artifact");
});

const shellExpanded = computed(() => {
    return expanded.value.has("shell");
});

function toggleWorkflow() {
    toggle("workflow");
}

function toggleArtifact() {
    toggle("artifact");
}

function toggleShell() {
    toggle("shell");
}
</script>
