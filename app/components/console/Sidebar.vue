<template>
    <aside class="flex w-64 shrink-0 flex-col border-r border-default">
        <WorkflowExplorer class="max-h-1/2 shrink-0" @open="openWorkflow" />

        <UiSeparator />

        <ArtifactExplorer class="min-h-0 flex-1" @open="openArtifact" />
    </aside>
</template>

<script lang="ts" setup>
const { openTab } = useTabs();

function openArtifact(artifact: Artifact) {
    openTab({
        key: `artifact:${artifact.identity}`,
        kind: "artifact",
        label: artifact.name,
        icon: "i-mingcute:file-fill",
        payload: artifact,
    });
}

function openWorkflow(payload: { workflow: Workflow; view: string; step?: number }) {
    openTab({
        key: `workflow:${payload.workflow.identity}:${payload.view}${payload.step ?? ""}`,
        kind: "workflow",
        label: `${payload.workflow.name} · ${payload.view}`,
        icon: "i-mingcute:git-branch-line",
        payload,
    });
}
</script>
