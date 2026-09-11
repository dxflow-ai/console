<template>
    <UiModal
        v-model:open="creatorOpen"
        title="New Workflow"
        description="Deploy a ready-to-run template from the hub, or upload a definition"
        :transition="false"
        :dismissible="!creating"
        :ui="{
            content: 'sm:max-w-xl',
        }"
    >
        <template #content>
            <div class="flex flex-col">
                <WorkflowCreatorSection
                    title="Deploy from the hub"
                    icon="i-hugeicons:package"
                    :expanded="isHub"
                    @toggle="expand('hub')"
                    first
                >
                    <HubCatalog :disabled="creating" @create="onCreate" />
                </WorkflowCreatorSection>
                <WorkflowCreatorSection
                    title="Upload a definition"
                    icon="i-hugeicons:cloud-upload"
                    :expanded="isUpload"
                    @toggle="expand('upload')"
                >
                    <WorkflowUploader :busy="uploading" :disabled="creating" @select="onSelect" @pick="onPick" />
                </WorkflowCreatorSection>
            </div>
        </template>
    </UiModal>
</template>

<script lang="ts" setup>
const { creatorOpen, creatorSection, closeCreator } = useWorkflowCreator();
const { create, createFromHub, creating } = useWorkflowActions();

const fileDialog = useWorkflowFileDialog();

const uploading = ref(false);

const isUpload = computed(() => {
    return creatorSection.value === "upload";
});

const isHub = computed(() => {
    return creatorSection.value === "hub";
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

    uploading.value = true;

    try {
        const workflow = await create(file);
        if (workflow) {
            closeCreator();
        }
    } finally {
        uploading.value = false;
    }
}

function onSelect(payload: { file: File }) {
    submit(payload.file);
}

function onCreate(payload: { workflow: HubWorkflow }) {
    createFromHub(payload.workflow.name);
}

fileDialog.onChange((files) => {
    submit(files?.[0]);
});
</script>
