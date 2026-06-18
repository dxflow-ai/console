<template>
    <aside class="flex w-64 shrink-0 flex-col border-r border-default">
        <WorkflowExplorer
            :expanded="expanded.has('workflow')"
            :class="expanded.has('workflow') ? 'min-h-0 flex-1' : 'shrink-0'"
            @toggle="toggle('workflow')"
            @open="openWorkflow"
            first
        />
        <ArtifactExplorer
            :expanded="expanded.has('artifact')"
            :class="expanded.has('artifact') ? 'min-h-0 flex-1' : 'shrink-0'"
            @toggle="toggle('artifact')"
            @open="openArtifact"
        />
        <ShellExplorer
            :expanded="expanded.has('shell')"
            :class="expanded.has('shell') ? 'min-h-0 flex-1' : 'shrink-0'"
            @toggle="toggle('shell')"
            @open="openShell"
            last
        />
    </aside>
</template>

<script lang="ts" setup>
const { openTab } = useTabs();
const { openSecondary } = useWorkspace();
const { expanded, toggle } = useExplorer();

function openWorkflow(payload: { workflow: Workflow; view: string; step?: number }) {
    const position: PanePosition = payload.view === "logs" ? "secondary" : "primary";

    openTab(position, {
        key: `workflow:${payload.workflow.identity}:${payload.view}${payload.step ?? ""}`,
        kind: "workflow",
        label: `${payload.workflow.name} · ${payload.view}`,
        icon: "i-mingcute:git-branch-line",
        payload,
    });

    if (position === "secondary") {
        openSecondary();
    }
}

function openArtifact(artifact: Artifact) {
    openTab("primary", {
        key: `artifact:${artifact.identity}`,
        kind: "artifact",
        label: artifact.name,
        icon: fileIcon(artifact.name),
        payload: artifact,
    });
}

function openShell(shell: Shell) {
    openTab("secondary", {
        key: `shell:${shell.identity}`,
        kind: "shell",
        label: shell.identity,
        icon: "i-hugeicons:command-line",
        payload: shell,
    });

    openSecondary();
}
</script>
