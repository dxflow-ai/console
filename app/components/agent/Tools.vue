<template>
    <template v-if="busy && tools.length">
        <div class="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            <template v-for="tool in tools" :key="tool.id">
                <div class="animate-fade animate-duration-300 flex items-center gap-1.5 text-xs">
                    <div class="relative size-3.5 shrink-0">
                        <UiIcon
                            :key="tool.status"
                            class="absolute inset-0 size-3.5"
                            :class="toolStatuses[tool.status].class"
                            :name="toolStatuses[tool.status].icon"
                        />
                    </div>
                    <span class="transition-colors duration-300" :class="toolStatuses[tool.status].text">
                        {{ toolLabel(tool) }}
                    </span>
                </div>
            </template>
        </div>
    </template>
</template>

<script lang="ts" setup>
const toolLabels: Record<string, Record<AgentToolStatus, string>> = {
    list: {
        running: "Listing",
        success: "Listed",
        failed: "List failed",
    },
    search: {
        running: "Searching",
        success: "Searched",
        failed: "Search failed",
    },
    create: {
        running: "Creating",
        success: "Created",
        failed: "Create failed",
    },
    start: {
        running: "Starting",
        success: "Started",
        failed: "Start failed",
    },
    stop: {
        running: "Stopping",
        success: "Stopped",
        failed: "Stop failed",
    },
    status: {
        running: "Checking status",
        success: "Checked status",
        failed: "Status failed",
    },
    logs: {
        running: "Reading logs",
        success: "Read logs",
        failed: "Logs failed",
    },
    stats: {
        running: "Reading stats",
        success: "Read stats",
        failed: "Stats failed",
    },
    files: {
        running: "Listing files",
        success: "Listed files",
        failed: "Files failed",
    },
    read: {
        running: "Reading",
        success: "Read",
        failed: "Read failed",
    },
    upload: {
        running: "Uploading",
        success: "Uploaded",
        failed: "Upload failed",
    },
    override: {
        running: "Overriding",
        success: "Overrode",
        failed: "Override failed",
    },
};

const toolStatuses: Record<AgentToolStatus, { icon: string; class: string; text: string }> = {
    running: {
        icon: "i-mingcute:loading-3-fill",
        class: "animate-spin text-muted",
        text: "text-muted",
    },
    success: {
        icon: "i-mingcute:check-circle-fill",
        class: "text-success",
        text: "text-default",
    },
    failed: {
        icon: "i-mingcute:close-circle-fill",
        class: "text-error",
        text: "text-error",
    },
};

const { messages, busy } = useAgent();

const tools = computed(() => {
    const last = messages.value[messages.value.length - 1];

    return last?.tools ?? [];
});

function toolLabel(tool: AgentTool) {
    return toolLabels[tool.name]?.[tool.status] ?? tool.name;
}
</script>
