<template>
    <div
        ref="dropzone-element"
        class="group flex h-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-6 text-center text-xs cursor-pointer transition-colors"
        :class="[
            dropping ? 'border-primary bg-primary/5' : 'border-default hover:border-accented hover:bg-elevated/40',
            props.disabled && 'pointer-events-none opacity-60',
        ]"
        @click="pick()"
    >
        <div
            class="flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors"
            :class="dropping ? 'bg-primary/10' : 'bg-elevated group-hover:bg-accented'"
        >
            <UiIcon
                class="size-4"
                :class="[dropping ? 'text-primary' : 'text-muted', props.busy && 'animate-spin']"
                :name="props.busy ? 'i-mingcute:loading-3-fill' : 'i-hugeicons:cloud-upload'"
            />
        </div>
        <div class="flex flex-col gap-0.5">
            <span class="font-semibold text-default">{{ title }}</span>
            <span class="text-muted">{{ description }}</span>
        </div>
    </div>
</template>

<script lang="ts" setup>
const props = defineProps({
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
    select(payload: { file: File }) {
        return true;
    },
    pick() {
        return true;
    },
});

const dropzoneElement = useTemplateRef<HTMLDivElement>("dropzone-element");

const { isOverDropZone: dropping } = useDropZone(dropzoneElement, {
    multiple: false,
    preventDefaultForUnhandled: true,
    onDrop(files) {
        select(files?.[0]);
    },
});

const title = computed(() => {
    if (props.busy) {
        return "Creating workflow";
    }

    return dropping.value ? "Release to upload" : "Drop a workflow file";
});

const description = computed(() => {
    return props.busy ? "Validating the definition and pulling images" : "A YAML definition, or click to pick one";
});

function pick() {
    emit("pick");
}

function select(file: Maybe<File>) {
    if (!file) {
        return;
    }

    emit("select", {
        file,
    });
}
</script>
