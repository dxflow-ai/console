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
            size="sm"
            variant="ghost"
            color="neutral"
            label="dxflow"
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
        <UiButton size="sm" variant="ghost" color="neutral" label="View" />
    </UiDropdownMenu>
    <UiDropdownMenu
        :items="resourceItems"
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
        <UiButton size="sm" variant="ghost" color="neutral" label="Resources" />
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
const { isMobile } = useWorkspace();
const { openShell } = useTabs();

const { create: createWorkflow } = useWorkflowActions();
const { create: createArtifact } = useArtifactActions();
const { create: createShell } = useShellActions();

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
    const output: DropdownMenuItem[] = [
        {
            label: colorMode.value === "dark" ? "Light Theme" : "Dark Theme",
            onSelect() {
                toggleTheme();
            },
        },
        {
            label: "Interface Scale",
            disabled: isMobile.value,
            ui: {
                content: "rounded-t-md",
            },
            children: [
                {
                    label: "Small · 100%",
                    icon: "i-mingcute:check-fill",
                    ui: {
                        itemLeadingIcon: ["size-2.5 mt-0.75", scale.value !== 1 && "opacity-0"],
                    },
                    onSelect() {
                        scale.value = 1;
                    },
                },
                {
                    label: "Medium · 125%",
                    icon: "i-mingcute:check-fill",
                    ui: {
                        itemLeadingIcon: ["size-2.5 mt-0.75", scale.value !== 1.25 && "opacity-0"],
                    },
                    onSelect() {
                        scale.value = 1.25;
                    },
                },
                {
                    label: "Large · 150%",
                    icon: "i-mingcute:check-fill",
                    ui: {
                        itemLeadingIcon: ["size-2.5 mt-0.75", scale.value !== 1.5 && "opacity-0"],
                    },
                    onSelect() {
                        scale.value = 1.5;
                    },
                },
            ],
        },
    ];

    return output;
});

const resourceItems = computed(() => {
    const output: DropdownMenuItem[] = [
        {
            label: "New workflow",
            onSelect() {
                workflowDialog.open();
            },
        },
        {
            label: "New Artifact",
            onSelect() {
                artifactDialog.open();
            },
        },
        {
            label: "New shell",
            disabled: isMobile.value,
            onSelect() {
                newShell();
            },
        },
    ];

    return output;
});

function toggleTheme() {
    colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
}

async function newShell() {
    const shell = await createShell();
    if (shell) {
        openShell({ shell });
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
