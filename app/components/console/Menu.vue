<template>
    <UiDropdownMenu
        :items="brandItems"
        :external-icon="false"
        :content="{
            align: 'start',
            side: 'bottom',
            sideOffset: 2,
        }"
    >
        <UiButton
            label="dxflow"
            size="sm"
            variant="link"
            color="neutral"
            :ui="{
                base: 'px-0 font-semibold focus-visible:ring-0 focus:outline-none',
            }"
        />
        <template #brand>
            <div class="flex items-center gap-2.5">
                <div class="flex size-9 shrink-0 items-center justify-center rounded bg-elevated">
                    <BrandMark class="size-5" />
                </div>
                <div class="flex flex-col text-left">
                    <span class="font-semibold text-default">dxflow</span>
                    <div class="text-xs text-muted -mt-0.5 w-22 truncate">
                        <span>Console · v{{ version || "unknown" }}</span>
                    </div>
                </div>
            </div>
        </template>
    </UiDropdownMenu>
    <UiDropdownMenu
        :items="viewItems"
        :content="{
            align: 'start',
            side: 'bottom',
            sideOffset: 2,
        }"
    >
        <UiButton
            label="View"
            size="sm"
            variant="link"
            color="neutral"
            :ui="{
                base: 'focus-visible:ring-0 focus:outline-none',
            }"
        />
    </UiDropdownMenu>
</template>

<script lang="ts" setup>
import type { DropdownMenuItem } from "@nuxt/ui";

const colorMode = useColorMode();

const { upScale, downScale, resetScale } = useScale();

const { sidebarOpen, panelOpen, toggleSidebar, togglePanel } = useWorkspace();

const confirmRestart = useConfirmToast({
    id: "engine-restart-confirm",
    icon: "i-mingcute:power-line",
    color: "neutral",
    title() {
        return "Restart Engine";
    },
    description() {
        return "Are you sure you want to restart the engine?";
    },
    async confirm() {
        try {
            await engineStore.action.restart();
        } catch (error) {
            dangerToast("Failed to restart engine", error as Error);
        }
    },
});

const version = computed(() => {
    return engineStore.view.attribute.value.version;
});

const brandItems = computed<DropdownMenuItem[][]>(() => {
    return [
        [
            {
                label: "dxflow",
                slot: "brand",
            },
        ],
        [
            {
                label: "Documentation",
                icon: "i-mingcute:book-2-line",
                to: "https://dxflow.ai/docs",
                target: "_blank",
            },
            {
                label: "Website",
                icon: "i-mingcute:world-2-line",
                to: "https://dxflow.ai",
                target: "_blank",
            },
        ],
        [
            {
                label: "Restart Engine",
                icon: "i-mingcute:power-line",
                color: "error",
                onSelect() {
                    confirmRestart.open();
                },
            },
        ] as any,
    ];
});

const viewItems = computed<DropdownMenuItem[][]>(() => {
    return [
        [
            {
                label: colorMode.value === "dark" ? "Light Theme" : "Dark Theme",
                icon: colorMode.value === "dark" ? "i-mingcute:sun-line" : "i-mingcute:moon-line",
                onSelect() {
                    toggleTheme();
                },
            },
        ],
        [
            {
                label: sidebarOpen.value ? "Hide Sidebar" : "Show Sidebar",
                icon: "i-mingcute:layout-leftbar-line",
                onSelect() {
                    toggleSidebar();
                },
            },
            {
                label: panelOpen.value ? "Hide Panel" : "Show Panel",
                icon: "i-mingcute:layout-bottom-line",
                onSelect() {
                    togglePanel();
                },
            },
        ],
        [
            {
                label: "Zoom In",
                icon: "i-mingcute:add-circle-line",
                onSelect() {
                    upScale();
                },
            },
            {
                label: "Zoom Out",
                icon: "i-mingcute:minus-circle-line",
                onSelect() {
                    downScale();
                },
            },
            {
                label: "Reset Zoom",
                icon: "i-mingcute:refresh-2-line",
                onSelect() {
                    resetScale();
                },
            },
        ],
    ];
});

function toggleTheme() {
    colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
}
</script>
