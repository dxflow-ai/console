<template>
    <UiModal
        :open="!authorized"
        :dismissible="false"
        :transition="false"
        :close="false"
        :ui="{
            content: 'max-w-2xs',
        }"
    >
        <template #content>
            <div class="flex w-full flex-col gap-5 rounded-md border border-default bg-default p-5">
                <div class="flex items-center gap-3">
                    <div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-elevated">
                        <BrandMark class="size-4" />
                    </div>
                    <div class="flex min-w-0 flex-col">
                        <span class="truncate text-sm font-semibold text-default">{{ title }}</span>
                        <span class="truncate text-xs text-muted">
                            <template v-if="provided">
                                <span>Expired</span>
                                <RelativeTime :timestamp="expiration" />
                            </template>
                            <template v-else>
                                <span>{{ subtitle }}</span>
                            </template>
                        </span>
                    </div>
                </div>
                <div class="flex flex-col gap-3">
                    <div class="flex flex-col gap-1.5">
                        <span class="text-xs text-muted">Method</span>
                        <UiSelect
                            v-model="method"
                            class="w-full"
                            :disabled="signing"
                            :items="[
                                {
                                    label: 'Private key',
                                    value: 'key',
                                },
                                {
                                    label: 'Pairing code',
                                    value: 'code',
                                },
                            ]"
                            :content="{
                                position: 'item-aligned',
                            }"
                        />
                    </div>
                    <template v-if="isCodeMethod">
                        <div class="flex flex-col gap-1.5">
                            <span class="text-xs text-muted">Code</span>
                            <UiInput
                                v-model="code"
                                class="w-full"
                                placeholder="--------"
                                :disabled="signing"
                                :maxlength="9"
                                :ui="{
                                    base: 'font-medium tracking-widest uppercase text-default',
                                }"
                                @keydown.enter="signin()"
                            />
                        </div>
                    </template>
                    <template v-else>
                        <div class="flex flex-col gap-1.5">
                            <span class="text-xs text-muted">Duration</span>
                            <UiSelect
                                v-model="lifetime"
                                class="w-full"
                                :disabled="signing"
                                :items="[
                                    {
                                        label: '1 hour',
                                        value: '1h',
                                    },
                                    {
                                        label: '24 hours',
                                        value: '24h',
                                    },
                                ]"
                                :content="{
                                    position: 'item-aligned',
                                }"
                            />
                        </div>
                    </template>
                </div>
                <div class="flex flex-col gap-2">
                    <UiButton :loading="signing" :label="title" @click="signin()" block />
                    <template v-if="hasStoredKey && !isCodeMethod">
                        <UiButton
                            variant="soft"
                            color="neutral"
                            label="Sign out & forget key"
                            :disabled="signing"
                            @click="signout()"
                            block
                        />
                    </template>
                </div>
                <div class="flex items-start gap-2 rounded-md bg-elevated/40 p-3 text-xs">
                    <UiIcon class="mt-px size-3.5 shrink-0 text-dimmed" :name="hintIcon" :class="hintIconClass" />
                    <div class="flex min-w-0 flex-col gap-0.5">
                        <template v-if="requested">
                            <span class="truncate text-muted">Waiting for approval</span>
                            <span class="truncate text-dimmed">Accept it on the engine</span>
                        </template>
                        <template v-else-if="isCodeMethod">
                            <span class="truncate text-muted">Code works once</span>
                            <span class="truncate text-dimmed">Run 'dxflow engine pair'</span>
                        </template>
                        <template v-else-if="provided">
                            <span class="truncate text-muted">Using your saved key</span>
                            <span class="truncate text-dimmed">Issues a fresh session</span>
                        </template>
                        <template v-else>
                            <span class="truncate text-muted">Key stays on this device</span>
                            <span class="truncate text-dimmed">Accepts .pem or .key</span>
                        </template>
                    </div>
                </div>
            </div>
        </template>
    </UiModal>
</template>

<script lang="ts" setup>
const { provided, expiration, authorized } = useSession();
const { loading: signingByFile, execute: executeSigninByFile } = useStoreAction(sessionStore, "signinByFile");

const { loading: signingByDatabase, execute: executeSigninByDatabase } = useStoreAction(
    sessionStore,
    "signinByDatabase",
);

const { loading: signingByCode, execute: executeSigninByCode } = useStoreAction(sessionStore, "signinByCode");

const { execute: executeSignout } = useStoreCompose(sessionStore, "signout");

const fileDialog = useFileDialog({
    multiple: false,
    reset: true,
    accept: ".pem,.key",
});

const hasStoredKey = ref(false);
const lifetime = ref("1h");
const method = ref("key");
const code = ref("");
const requested = ref(false);

const signing = computed(() => {
    return signingByFile.value || signingByDatabase.value || signingByCode.value;
});

const isCodeMethod = computed(() => {
    return method.value === "code";
});

const title = computed(() => {
    return provided.value ? "Sign In Again" : "Sign In";
});

const subtitle = computed(() => {
    if (isCodeMethod.value) {
        return "Use a pairing code";
    }

    return "Use your private key";
});

const hintIcon = computed(() => {
    if (requested.value) {
        return "i-mingcute:loading-3-fill";
    }

    return "i-mingcute:safe-lock-fill";
});

const hintIconClass = computed(() => {
    return requested.value ? "animate-spin" : "";
});

async function refreshStoredKey() {
    const [keyString] = await newDatabaseWrapper("auth").read("key");

    hasStoredKey.value = !!keyString;
}

async function signinByFile(file: File) {
    try {
        await executeSigninByFile({
            payload: {
                file,
                lifetime: lifetime.value,
            },
        });
    } catch (error) {
        return dangerToast("Failed to sign-in", error as Error);
    }
}

async function signinByDatabase() {
    try {
        await executeSigninByDatabase({
            payload: {
                lifetime: lifetime.value,
            },
        });
    } catch {
        hasStoredKey.value = false;

        return fileDialog.open();
    }
}

function markRequested() {
    requested.value = true;
}

function resetPairCode() {
    code.value = "";

    window.history.replaceState(null, "", window.location.pathname + window.location.search);
}

async function signinByCode() {
    if (!code.value) {
        return;
    }

    try {
        await executeSigninByCode({
            payload: {
                code: code.value,
                requested: markRequested,
            },
        });

        resetPairCode();
    } catch (error) {
        return dangerToast("Failed to sign-in", error as Error);
    } finally {
        requested.value = false;
    }
}

function signin() {
    if (isCodeMethod.value) {
        return signinByCode();
    }

    if (hasStoredKey.value) {
        return signinByDatabase();
    }

    fileDialog.open();
}

async function signout() {
    await executeSignout(true);

    hasStoredKey.value = false;
}

fileDialog.onChange((files) => {
    if (files?.length) {
        signinByFile(files[0] as File);
    }
});

function readPairCode() {
    const matched = window.location.hash.match(/^#pair=([a-zA-Z0-9-]+)$/);
    if (!matched) {
        return;
    }

    method.value = "code";
    code.value = matched[1] as string;
}

onMounted(() => {
    refreshStoredKey();
    readPairCode();
});
</script>
