<template>
    <div class="h-full min-h-0 flex-1 overflow-auto">
        <template v-if="content">
            <div class="markdown p-6 select-text" v-html="content" />
        </template>
        <template v-else-if="loading">
            <Empty
                icon="i-hugeicons:rocket-01"
                title="Loading welcome"
                description="Fetching the latest welcome guide"
                :loading="true"
            />
        </template>
        <template v-else>
            <Empty
                icon="i-hugeicons:alert-02"
                title="Nothing to show"
                description="The welcome guide couldn't be loaded"
            />
        </template>
    </div>
</template>

<script lang="ts" setup>
const { execute: executeWelcome, loading } = useStoreAction(engineStore, "getWelcome", {
    isolated: true,
});

const markdown = newMarkdownWrapper();

const content = ref("");

async function load() {
    content.value = "";

    try {
        const source = await executeWelcome();

        content.value = markdown.render(source);
    } catch (error) {
        dangerToast("Failed to load the welcome guide", error as Error);
    }
}

onMounted(() => {
    load();
});
</script>
