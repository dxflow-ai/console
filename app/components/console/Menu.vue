<template>
    <UiDropdownMenu
        :items="brandItems"
        :modal="false"
        :external-icon="false"
        :content="{
            align: 'start',
            side: 'bottom',
            sideOffset: -0.5,
        }"
        :ui="{
            content: 'rounded-t-none',
        }"
        arrow
    >
        <UiButton
            label="dxflow"
            size="sm"
            variant="ghost"
            color="neutral"
            :ui="{
                base: 'font-semibold',
            }"
        />
    </UiDropdownMenu>
    <UiDropdownMenu
        :items="viewItems"
        :modal="false"
        :content="{
            align: 'start',
            side: 'bottom',
            sideOffset: -0.5,
        }"
        :ui="{
            content: 'rounded-t-none',
        }"
        arrow
    >
        <UiButton label="View" size="sm" variant="ghost" color="neutral" />
    </UiDropdownMenu>
    <UiDropdownMenu
        :items="workflowItems"
        :modal="false"
        :content="{
            align: 'start',
            side: 'bottom',
            sideOffset: -0.5,
        }"
        :ui="{
            content: 'rounded-t-none',
        }"
        arrow
    >
        <UiButton label="Workflow" size="sm" variant="ghost" color="neutral" />
    </UiDropdownMenu>
    <UiDropdownMenu
        :items="artifactItems"
        :modal="false"
        :content="{
            align: 'start',
            side: 'bottom',
            sideOffset: -0.5,
        }"
        :ui="{
            content: 'rounded-t-none',
        }"
        arrow
    >
        <UiButton label="Artifact" size="sm" variant="ghost" color="neutral" />
    </UiDropdownMenu>
    <UiDropdownMenu
        :items="shellItems"
        :modal="false"
        :content="{
            align: 'start',
            side: 'bottom',
            sideOffset: -0.5,
        }"
        :ui="{
            content: 'rounded-t-none',
        }"
        arrow
    >
        <UiButton label="Shell" size="sm" variant="ghost" color="neutral" />
    </UiDropdownMenu>
    <UiModal
        v-model:open="systemOpen"
        title="Engine Monitor"
        :transition="false"
        :ui="{
            content: 'sm:max-w-3xl',
        }"
    >
        <template #body>
            <Overview />
        </template>
    </UiModal>
    <UiModal v-model:open="licenseOpen" title="Engine License" :transition="false">
        <template #body>
            <License />
        </template>
    </UiModal>
</template>

<script lang="ts" setup>
import type { DropdownMenuItem } from "@nuxt/ui";

const colorMode = useColorMode();

const { scale } = useScale();

const { openShell } = useTabs();

const { data: workflows } = useStoreView(workflowStore, "list");

const { data: artifacts } = useStoreView(artifactStore, "list", (items) => {
    const identities = new Set(
        items.map((item) => {
            return item.identity;
        }),
    );

    return items.filter((item) => {
        return !identities.has(parentOf(item.identity));
    });
});

const { data: shells } = useStoreView(shellStore, "list");

const { create: createWorkflow, prune: pruneWorkflows } = useWorkflowActions();
const { create: createArtifact, createDirectory } = useArtifactActions();
const { create: createShell, prune: pruneShells } = useShellActions();

const workflowDialog = useWorkflowFileDialog();
const artifactDialog = useArtifactFileDialog();

const systemOpen = ref(false);
const licenseOpen = ref(false);

const brandItems = computed(() => {
    const output: DropdownMenuItem[][] = [
        [
            {
                label: "Engine Monitor",
                onSelect() {
                    systemOpen.value = true;
                },
            },
            {
                label: "Engine License",
                onSelect() {
                    licenseOpen.value = true;
                },
            },
        ],
        [
            {
                label: "Documentation",
                to: "https://dxflow.ai/docs",
                target: "_blank",
            },
        ],
    ];

    return output;
});

const viewItems = computed(() => {
    const output: DropdownMenuItem[][] = [
        [
            {
                label: colorMode.value === "dark" ? "Light Theme" : "Dark Theme",
                onSelect() {
                    toggleTheme();
                },
            },
        ],
        [
            {
                label: "Small · 100%",
                type: "checkbox",
                checked: scale.value === 1,
                onSelect() {
                    scale.value = 1;
                },
            },
            {
                label: "Medium · 125%",
                type: "checkbox",
                checked: scale.value === 1.25,
                onSelect() {
                    scale.value = 1.25;
                },
            },
            {
                label: "Large · 150%",
                type: "checkbox",
                checked: scale.value === 1.5,
                onSelect() {
                    scale.value = 1.5;
                },
            },
        ],
    ];

    return output;
});

const workflowItems = computed(() => {
    const output: DropdownMenuItem[][] = [
        [
            {
                label: "New workflow",
                onSelect() {
                    workflowDialog.open();
                },
            },
        ],
        [
            {
                label: "Prune all",
                disabled: !workflows.value.length,
                onSelect() {
                    pruneWorkflows();
                },
            },
        ],
    ];

    return output;
});

const artifactItems = computed(() => {
    const output: DropdownMenuItem[] = [
        {
            label: "New Artifact",
            onSelect() {
                artifactDialog.open();
            },
        },
        {
            label: "New directory",
            onSelect() {
                createDirectory(".", artifacts.value);
            },
        },
    ];

    return output;
});

const shellItems = computed(() => {
    const output: DropdownMenuItem[][] = [
        [
            {
                label: "New shell",
                onSelect() {
                    newShell();
                },
            },
        ],
        [
            {
                label: "Prune all",
                disabled: !shells.value.length,
                onSelect() {
                    pruneShells();
                },
            },
        ],
    ];

    return output;
});

function toggleTheme() {
    colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
}

async function newShell() {
    const shell = await createShell();

    if (shell) {
        openShell({
            shell,
        });
    }
}

workflowDialog.onChange((files) => {
    const file = files?.[0];
    if (file) {
        createWorkflow(file);
    }
});

artifactDialog.onChange((files) => {
    if (files?.length) {
        createArtifact(".", Array.from(files));
    }
});
</script>
