<template>
    <div class="flex flex-1 items-center justify-center p-3">
        <div class="flex flex-col gap-1 text-xs">
            <template v-for="item in explorerItems" :key="item.key">
                <UiButton
                    variant="ghost"
                    class="flex cursor-pointer justify-start items-center gap-3"
                    :disabled="item.disabled"
                    @click="item.action()"
                >
                    <div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-elevated">
                        <UiIcon class="size-4 text-muted group-hover:text-default" :name="item.icon" />
                    </div>
                    <div class="flex min-w-0 flex-1 flex-col items-start">
                        <span class="font-semibold text-default">{{ item.title }}</span>
                        <span class="truncate text-muted">{{ item.description }}</span>
                    </div>
                </UiButton>
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
    disabled: boolean;
    action: () => void;
};

const { expand } = useExplorer();
const { isMobile, sidebarOpen, toggleSidebar } = useWorkspace();

const explorerItems = computed(() => {
    const output: IntroItem[] = [
        {
            key: "workflow",
            title: "Workflows",
            description: "Browse and run automation pipelines.",
            icon: "i-hugeicons:git-branch",
            disabled: false,
            action: () => {
                reveal("workflow");
            },
        },
        {
            key: "artifact",
            title: "Artifacts",
            disabled: false,
            description: "Inspect generated files and outputs.",
            icon: "i-hugeicons:file-01",
            action: () => {
                reveal("artifact");
            },
        },
        {
            key: "shell",
            title: "Shells",
            description: "Open an interactive engine session.",
            icon: "i-hugeicons:command-line",
            disabled: isMobile.value,
            action: () => {
                reveal("shell");
            },
        },
    ];

    return output;
});

function reveal(key: ExplorerKey) {
    if (!sidebarOpen.value) {
        toggleSidebar();
    }

    expand(key);
}
</script>
