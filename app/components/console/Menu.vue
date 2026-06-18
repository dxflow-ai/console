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

const systemOpen = ref(false);
const licenseOpen = ref(false);

const brandItems = computed<DropdownMenuItem[][]>(() => {
    return [
        [
            {
                label: "Engine Monitor",
                icon: "i-mingcute:server-2-line",
                onSelect() {
                    systemOpen.value = true;
                },
            },
            {
                label: "Engine License",
                icon: "i-mingcute:certificate-line",
                onSelect() {
                    licenseOpen.value = true;
                },
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
                label: "Small · 100%",
                icon: scale.value === 1 ? "i-mingcute:checkbox-line" : "i-mingcute:minus-square-line",
                onSelect() {
                    scale.value = 1;
                },
            },
            {
                label: "Medium · 125%",
                icon: scale.value === 1.25 ? "i-mingcute:checkbox-line" : "i-mingcute:minus-square-line",
                onSelect() {
                    scale.value = 1.25;
                },
            },
            {
                label: "Large · 150%",
                icon: scale.value === 1.5 ? "i-mingcute:checkbox-line" : "i-mingcute:minus-square-line",
                onSelect() {
                    scale.value = 1.5;
                },
            },
        ],
    ];
});

function toggleTheme() {
    colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
}
</script>
