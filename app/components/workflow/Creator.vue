<template>
    <UiModal
        v-model:open="creatorOpen"
        title="New Workflow"
        description="Upload a definition, or deploy a ready-to-run template from the hub"
        :transition="false"
        :dismissible="!creating"
        :ui="{
            content: 'sm:max-w-xl',
        }"
    >
        <template #content>
            <div class="flex flex-col">
                <WorkflowCreatorSection
                    title="Upload a definition"
                    icon="i-hugeicons:cloud-upload"
                    :expanded="isUpload"
                    @toggle="expand('upload')"
                    first
                >
                    <WorkflowUploader :busy="uploading" :disabled="creating" @select="onSelect" @pick="onPick" />
                </WorkflowCreatorSection>
                <WorkflowCreatorSection
                    title="Deploy from the hub"
                    icon="i-hugeicons:package"
                    :expanded="isHub"
                    @toggle="expand('hub')"
                >
                    <HubCatalog :pending="pendingName" :disabled="creating" @create="onCreate" />
                </WorkflowCreatorSection>
            </div>
        </template>
    </UiModal>
</template>

<script lang="ts" setup>
const { creatorOpen, creatorSection, closeCreator } = useWorkflowCreator();
const { create, createFromHub, creating } = useWorkflowActions();

const fileDialog = useWorkflowFileDialog();

const pendingName = ref<MaybeString>();

const isUpload = computed(() => {
    return creatorSection.value === "upload";
});

const isHub = computed(() => {
    return creatorSection.value === "hub";
});

const uploading = computed(() => {
    return creating.value && !pendingName.value;
});

function expand(section: WorkflowCreatorSection) {
    if (creating.value) {
        return;
    }

    creatorSection.value = section;
}

function onPick() {
    fileDialog.open();
}

async function submit(file: Maybe<File>) {
    if (!file) {
        return;
    }

    if (!isWorkflowDefinition(file)) {
        return dangerToast("Unsupported file", "Pick a YAML workflow definition");
    }

    const workflow = await create(file);
    if (workflow) {
        closeCreator();
    }
}

function onSelect(payload: { file: File }) {
    submit(payload.file);
}

async function onCreate(payload: { workflow: HubWorkflow }) {
    pendingName.value = payload.workflow.name;

    try {
        const workflow = await createFromHub(payload.workflow.name);
        if (workflow) {
            closeCreator();
        }
    } finally {
        pendingName.value = undefined;
    }
}

fileDialog.onChange((files) => {
    submit(files?.[0]);
});
</script>
