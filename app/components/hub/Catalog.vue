<template>
    <div class="flex h-full min-h-0 flex-col gap-2">
        <UiInput v-model="query" class="w-full" placeholder="Search workflows" :disabled="props.disabled" />
        <div class="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <template v-if="workflows.length">
                <template v-for="workflow in workflows" :key="workflow.name">
                    <HubEntry
                        :workflow="workflow"
                        :busy="props.pending === workflow.name"
                        :disabled="props.disabled"
                        @create="onCreate"
                    />
                </template>
            </template>
            <template v-else>
                <Empty
                    icon="i-hugeicons:package"
                    :title="searching ? 'Loading hub' : 'No workflows found'"
                    :description="searching ? 'Fetching the hub catalog' : 'Try another search'"
                    :loading="searching"
                />
            </template>
        </div>
    </div>
</template>

<script lang="ts" setup>
const props = defineProps({
    pending: {
        type: String as PropType<MaybeString>,
        default: undefined,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits({
    create(payload: { workflow: HubWorkflow }) {
        return true;
    },
});

const { workflows, query, searching, browse } = useHubCatalog();

function onCreate(payload: { workflow: HubWorkflow }) {
    emit("create", payload);
}

onMounted(() => {
    browse();
});
</script>
