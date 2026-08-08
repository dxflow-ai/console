<template>
    <div class="px-1">
        <ContextMenu :items="menu">
            <div
                class="flex w-full items-center gap-1.5 rounded-sm px-2 py-1.5 text-xs hover:bg-elevated cursor-pointer"
                :class="{
                    'pointer-events-none opacity-60': busy,
                }"
                @click="open()"
            >
                <span class="size-2 shrink-0 rounded-full" :class="statusColor" />
                <span class="min-w-0 flex-1 truncate">{{ props.workflow.name }}</span>
                <template v-if="published.length">
                    <UiIcon name="i-mingcute:link-line" class="size-3 shrink-0 text-muted" />
                </template>
                <small class="shrink-0 text-muted">
                    <RelativeTime :timestamp="props.workflow.created_at" />
                </small>
            </div>
        </ContextMenu>
    </div>
</template>

<script lang="ts" setup>
import type { ContextMenuItem } from "@nuxt/ui";

const props = defineProps({
    workflow: {
        type: Object as PropType<Workflow>,
        required: true,
    },
});

const emit = defineEmits({
    open(payload: { workflow: Workflow }) {
        return true;
    },
});

const colors: Record<string, string> = {
    started: "bg-green-500",
    running: "bg-green-500",
    executed: "bg-green-500",
    created: "bg-blue-500",
    pending: "bg-neutral-500",
    exited: "bg-neutral-500",
    stopped: "bg-yellow-500",
    killed: "bg-yellow-500",
    failed: "bg-red-500",
};

const actions = useWorkflowActions();
const links = useWorkflowLinks();

const busy = computed(() => {
    return actions.isBusy(props.workflow.identity);
});

const published = computed(() => {
    return links.published(props.workflow);
});

const statusColor = computed(() => {
    return colors[props.workflow.status] ?? "bg-neutral-500";
});

const menu = computed(() => {
    const output: ContextMenuItem[] = [
        {
            label: "Start",
            disabled: busy.value || !canStartWorkflow(props.workflow.status),
            onSelect() {
                actions.start(props.workflow);
            },
        },
        {
            label: "Start with link",
            disabled: busy.value || !canStartWorkflow(props.workflow.status) || !links.linkable.value,
            onSelect() {
                actions.start(props.workflow, true);
            },
        },
        {
            label: "Stop",
            disabled: busy.value || !canStopWorkflow(props.workflow.status),
            onSelect() {
                actions.stop(props.workflow);
            },
        },
        {
            label: "Remove",
            disabled: busy.value,
            onSelect() {
                actions.remove(props.workflow);
            },
        },
    ];

    if (published.value.length) {
        const children: ContextMenuItem[] = published.value.map((link) => {
            return {
                label: link.step,
                onSelect() {
                    links.openLink(link);
                },
            };
        });

        output.push({
            label: "Open link",
            children,
        });
    }

    return output;
});

function open() {
    emit("open", { workflow: props.workflow });
}
</script>
