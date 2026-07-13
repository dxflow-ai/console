<template>
    <aside class="relative flex w-96 shrink-0 flex-col overflow-x-hidden bg-default border-l border-default">
        <template v-if="selected">
            <AgentSession />
        </template>
        <template v-else>
            <AgentExplorer :expanded="agentExpanded" @open="onOpen" @toggle="toggleAgent()" first last />
        </template>
    </aside>
</template>

<script lang="ts" setup>
const { selected, select } = useAgent();
const { expanded, toggle } = useSidekick();

const agentExpanded = computed(() => {
    return expanded.value.has("agent");
});

function toggleAgent() {
    toggle("agent");
}

function onOpen(payload: { session: AgentSession }) {
    select(payload.session.identity);
}
</script>
