<template>
    <UiTooltip
        :text="panelOpen ? 'Hide Panel' : 'Show Panel'"
        :delay-duration="500"
        :content="{
            side: 'top',
        }"
    >
        <UiButton
            size="xs"
            variant="ghost"
            color="neutral"
            :icon="panelOpen ? 'i-mingcute:layout-bottom-fill' : 'i-mingcute:layout-bottom-line'"
            @click="togglePanel()"
            square
        />
    </UiTooltip>
</template>

<script lang="ts" setup>
const { panelOpen, togglePanel } = useWorkspace();
</script>
