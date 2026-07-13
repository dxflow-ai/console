<template>
    <div class="flex min-h-0 flex-1 flex-col bg-muted/10">
        <ExplorerSection title="Agent session" :empty="!messages.length" first last>
            <template #actions>
                <UiButton
                    icon="i-mingcute:arrow-left-circle-line"
                    size="xs"
                    variant="link"
                    color="neutral"
                    class="pr-0!"
                    :ui="{
                        leadingIcon: 'size-3.5',
                    }"
                    @click="deselect()"
                    square
                />
            </template>
            <template #empty>
                <Empty
                    icon="i-hugeicons:sparkles"
                    description="Your conversation appears here"
                    :title="loading ? 'Loading session' : 'No messages yet'"
                    :loading="loading"
                />
            </template>
            <AgentConversation />
        </ExplorerSection>
        <AgentPrompt />
    </div>
</template>

<script lang="ts" setup>
const { activeId, messages, deselect } = useAgent();
const { load, loading } = useAgentActions();

onMounted(() => {
    if (activeId.value) {
        load(activeId.value);
    }
});
</script>
