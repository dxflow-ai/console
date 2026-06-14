<template>
    <UiModal
        v-model:open="state"
        :close="false"
        :ui="{
            content: 'max-w-md',
            body: 'space-y-4',
            footer: 'justify-end',
        }"
        description="Create a new license account manually."
    >
        <template #title>
            <div class="flex items-center gap-2">
                <UiIcon name="i-mingcute:user-add-line" class="relative -top-px size-5 min-w-5" />
                <span>New Account</span>
            </div>
        </template>
        <template #body>
            <UiFormField
                :ui="{
                    hint: 'text-xs text-muted opacity-50',
                }"
                label="Identity"
                hint="Unique account identifier"
                required
            >
                <UiInput
                    v-model="form.identity"
                    class="w-full"
                    placeholder="Account identity"
                    trailing-icon="i-mingcute:code-line"
                />
            </UiFormField>
            <UiFormField label="Email" required>
                <UiInput
                    v-model="form.email"
                    class="w-full"
                    type="email"
                    placeholder="Account email"
                    trailing-icon="i-mingcute:mail-line"
                />
            </UiFormField>
            <UiFormField label="Name">
                <UiInput
                    v-model="form.name"
                    class="w-full"
                    placeholder="Account name"
                    trailing-icon="i-mingcute:user-3-line"
                />
            </UiFormField>
            <UiFormField label="Authenticator" required>
                <UiSelect
                    v-model="form.authenticator"
                    :items="authenticatorOptions"
                    class="w-full"
                    placeholder="Select authenticator"
                />
            </UiFormField>
        </template>
        <template #footer>
            <UiButton size="sm" variant="soft" color="neutral" @click="cancel()"><span>Cancel</span></UiButton>
            <UiButton :disabled="!isValid" size="sm" @click="create()">
                <span>Create</span>
                <Loading :active="creating" />
            </UiButton>
        </template>
    </UiModal>
</template>

<script lang="ts" setup>
import Loading from "~/components/Loading.vue";

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false,
    },
    creating: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits({
    "update:modelValue": null,
    create: null,
});

const authenticatorOptions = [
    { label: "Google", value: "google" },
    { label: "Stripe", value: "stripe" },
];

const defaultForm = {
    identity: "",
    email: "",
    name: "",
    authenticator: "google",
};
const form = ref({ ...defaultForm });

const state = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emit("update:modelValue", value);
    },
});

const isValid = computed(() => {
    return form.value.identity.length > 0 && form.value.email.length > 0 && form.value.authenticator.length > 0;
});

watch(state, (value) => {
    if (value) {
        resetForm();
    }
});

function resetForm() {
    form.value = { ...defaultForm };
}

function cancel() {
    state.value = false;
}

function create() {
    const data: Partial<Account> = {
        identity: form.value.identity,
        email: form.value.email,
        name: form.value.name || undefined,
        authenticator: form.value.authenticator,
    };
    emit("create", data);
}
</script>
