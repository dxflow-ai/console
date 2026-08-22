<template>
    <div
        class="group flex w-full items-center gap-2.5 py-1.5 text-xs cursor-pointer"
        :class="{
            'pointer-events-none opacity-60': props.disabled,
        }"
        @click="create()"
    >
        <div
            class="flex size-8 shrink-0 items-center justify-center rounded-md bg-elevated transition-colors group-hover:bg-accented"
        >
            <UiIcon
                class="size-3.5 transition-colors text-muted group-hover:text-highlighted"
                :class="{
                    'animate-spin': props.busy,
                }"
                :name="props.busy ? 'i-mingcute:loading-3-fill' : 'i-hugeicons:package'"
            />
        </div>
        <div class="flex min-w-0 flex-1 flex-col gap-0.5">
            <span class="truncate font-semibold transition-colors text-default group-hover:text-highlighted">
                {{ props.workflow.name }}
            </span>
            <span class="truncate text-muted">{{ props.workflow.description }}</span>
        </div>
    </div>
</template>

<script lang="ts" setup>
const props = defineProps({
    workflow: {
        type: Object as PropType<HubWorkflow>,
        required: true,
    },
    busy: {
        type: Boolean,
        default: false,
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

function create() {
    emit("create", {
        workflow: props.workflow,
    });
}
</script>
