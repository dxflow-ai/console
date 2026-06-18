<template>
    <aside class="flex w-64 shrink-0 flex-col border-r border-default">
        <WorkflowExplorer
            :expanded="expanded === 'workflow'"
            :class="expanded === 'workflow' ? 'min-h-0 flex-1' : 'shrink-0'"
            @toggle="toggle('workflow')"
            @open="openWorkflow"
        />
        <UiSeparator />
        <ArtifactExplorer
            :expanded="expanded === 'artifact'"
            :class="expanded === 'artifact' ? 'min-h-0 flex-1' : 'shrink-0'"
            @toggle="toggle('artifact')"
            @open="openArtifact"
        />
        <UiSeparator />
        <ShellExplorer
            :expanded="expanded === 'shell'"
            :class="expanded === 'shell' ? 'min-h-0 flex-1' : 'shrink-0'"
            @toggle="toggle('shell')"
            @open="openShell"
        />
    </aside>
</template>

<script lang="ts" setup>
const { openTab } = useTabs();
const { openSecondary } = useWorkspace();

const expanded = ref<"workflow" | "artifact" | "shell">("workflow");

function toggle(key: "workflow" | "artifact" | "shell") {
    expanded.value = key;
}

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
