<template>
    <div class="flex flex-1 items-center justify-center overflow-auto p-6">
        <div class="flex w-full max-w-xs flex-col gap-1 text-xs">
            <template v-for="item in explorerItems" :key="item.key">
                <div
                    class="group flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-muted/50"
                    @click="item.action()"
                >
                    <div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-elevated">
                        <UiIcon class="size-4 text-muted group-hover:text-default" :name="item.icon" />
                    </div>
                    <div class="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span class="font-semibold text-default">{{ item.title }}</span>
                        <span class="truncate text-muted">{{ item.description }}</span>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script lang="ts" setup>
type IntroItem = {
    key: string;
    title: string;
    description: string;
    icon: string;
    action: () => void;
};

const { sidebarOpen, toggleSidebar } = useWorkspace();
const { expand } = useExplorer();

const explorerItems: IntroItem[] = [
    {
        key: "workflow",
        title: "Workflows",
        description: "Browse and run your automation pipelines.",
        icon: "i-hugeicons:git-branch",
        action: () => {
            reveal("workflow");
        },
    },
    {
        key: "artifact",
        title: "Artifacts",
        description: "Inspect generated files and outputs.",
        icon: "i-hugeicons:file-01",
        action: () => {
            reveal("artifact");
        },
    },
    {
        key: "shell",
        title: "Shells",
        description: "Open an interactive session on the engine.",
        icon: "i-hugeicons:command-line",
        action: () => {
            reveal("shell");
        },
    },
];

function reveal(key: ExplorerKey) {
    if (!sidebarOpen.value) {
        toggleSidebar();
    }

    expand(key);
}
</script>
