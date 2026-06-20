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
                <div class="flex flex-col items-center gap-3 text-center">
                    <div
                        class="flex size-11 items-center justify-center rounded-full border border-default bg-elevated"
                    >
                        <BrandMark class="size-5" />
                    </div>
                    <div class="flex flex-col gap-1">
                        <span class="font-semibold text-default">{{ title }}</span>
                        <span class="text-xs text-muted">
                            <template v-if="provided">
                                <span>Your session has expired</span>
                            </template>
                            <template v-else>
                                <span>Authenticate with your private key</span>
                            </template>
                        </span>
                    </div>
                </div>
                <div class="flex flex-col gap-2 rounded border border-default bg-elevated/40 p-3 text-xs">
                    <div class="flex items-center justify-between gap-3">
                        <span class="text-muted">Method</span>
                        <span class="font-medium text-default">Private key</span>
                    </div>
                    <div class="flex items-center justify-between gap-3">
                        <span class="text-muted">Duration</span>
                        <UiSelect
                            v-model="lifetime"
                            size="xs"
                            variant="none"
                            :disabled="signing"
                            :items="[
                                {
                                    label: '1 hour',
                                    value: '1h',
                                },
                                {
                                    label: '1 day',
                                    value: '24h',
                                },
                            ]"
                            :content="{
                                position: 'item-aligned',
                            }"
                            :ui="{
                                base: 'w-14 p-0 font-medium text-default',
                                value: 'flex-1 text-right',
                                trailingIcon: 'hidden',
                            }"
                        />
                    </div>
                    <template v-if="provided">
                        <div class="flex items-center justify-between gap-3">
                            <span class="text-muted">Expired</span>
                            <RelativeTime class="font-medium text-default" :timestamp="expiration" />
                        </div>
                    </template>
                </div>
                <div class="flex flex-col gap-2">
                    <UiButton :loading="signing" :label="title" @click="signin()" block />
                    <template v-if="hasStoredKey">
                        <UiButton
                            label="Sign out & forget key"
                            variant="soft"
                            color="neutral"
                            :disabled="signing"
                            @click="signout()"
                            block
                        />
                    </template>
                </div>
                <div class="flex items-start gap-2 rounded border border-default bg-elevated/40 p-3 text-xs">
                    <UiIcon name="i-mingcute:safe-lock-fill" class="mt-px size-3.5 shrink-0 text-dimmed" />
                    <div class="flex flex-col gap-0.5">
                        <template v-if="provided">
                            <span class="text-muted">Using your saved key</span>
                            <span class="text-dimmed">A fresh session will be issued</span>
                        </template>
                        <template v-else>
                            <span class="text-muted">Key never leaves this device</span>
                            <span class="text-dimmed">Accepts .pem or .key files</span>
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

const { execute: executeSignout } = useStoreAction(sessionStore, "signout");

const fileDialog = useFileDialog({
    multiple: false,
    reset: true,
    accept: ".pem,.key",
});

const hasStoredKey = ref(false);
const lifetime = ref("1h");

const signing = computed(() => {
    return signingByFile.value || signingByDatabase.value;
});

const title = computed(() => {
    return provided.value ? "Sign In Again" : "Sign In";
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

function signin() {
    if (hasStoredKey.value) {
        return signinByDatabase();
    }

    fileDialog.open();
}

async function signout() {
    await executeSignout();

    hasStoredKey.value = false;
}

fileDialog.onChange((files) => {
    if (files?.length) {
        signinByFile(files[0] as File);
    }
});

onMounted(() => {
    refreshStoredKey();
});
</script>
