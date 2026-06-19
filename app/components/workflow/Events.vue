<template>
    <div class="relative min-h-full">
        <div
            class="flex flex-col gap-1.5"
            :class="{
                'opacity-0': loading,
            }"
        >
            <template v-for="(event, index) in events" :key="index">
                <div class="flex items-baseline gap-2 text-sm">
                    <DateLabel
                        class="shrink-0 text-xs text-dimmed"
                        month="short"
                        day="numeric"
                        hour="numeric"
                        minute="numeric"
                        second="numeric"
                        :timestamp="event.time"
                    />
                    <span>{{ event.message }}</span>
                </div>
            </template>
            <template v-if="!events.length">
                <span class="text-xs text-dimmed">No events</span>
            </template>
        </div>
        <Loading :active="loading" />
    </div>
</template>

<script lang="ts" setup>
const props = defineProps({
    workflow: {
        type: Object as PropType<Workflow>,
        required: true,
    },
});

const { data: events, loading } = useWorkflowEvents(props.workflow.identity);
</script>
