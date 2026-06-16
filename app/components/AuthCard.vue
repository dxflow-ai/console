<template>
    <UiCard
        :ui="{
            body: 'flex flex-col items-center gap-6 py-8',
        }"
    >
        <div class="flex flex-col items-center gap-4 text-center">
            <div class="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UiIcon name="i-mingcute:fingerprint-line" class="size-6" />
            </div>
            <div class="flex flex-col items-center gap-1">
                <span class="text-lg font-bold">{{ title }}</span>
                <span class="flex items-center gap-1 text-sm text-muted">
                    <template v-if="hasStoredKey && provided">
                        <span>Expired</span>
                        <RelativeTime :timestamp="expiration" />
                    </template>
                    <template v-else>
                        <span>Using your private key</span>
                    </template>
                </span>
            </div>
        </div>
        <div class="flex w-full flex-col gap-2">
            <UiButton size="sm" :loading="signing" :label="title" @click="signin()" block />
            <template v-if="hasStoredKey">
                <UiButton
                    label="Use a different key"
                    variant="soft"
                    color="neutral"
                    size="sm"
                    :disabled="signing"
                    @click="forgetStoredKey()"
                    block
                />
            </template>
        </div>
    </UiCard>
</template>

<script lang="ts" setup>
import { sleep } from "radash";
import { enableStandby } from "~/components/Standby.vue";

const { provided, expiration } = useSession();
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

// "Sign In Again" (re-auth from the stored key) is only possible while a key is
// actually persisted — i.e. after a token expiry, not after an explicit sign-out
// (which clears the stored key). A fresh visitor has none either.
const hasStoredKey = ref(false);

const signing = computed(() => {
    return signingByFile.value || signingByDatabase.value;
});

const title = computed(() => {
    return hasStoredKey.value ? "Sign In Again" : "Sign In";
});

async function refreshStoredKey() {
    const [keyString] = await newDatabaseWrapper("auth").read("key");

    hasStoredKey.value = !!keyString;
}

async function signinByFile(file: File) {
    try {
        await executeSigninByFile({ payload: { file } });
    } catch (error) {
        return dangerToast("Failed to sign-in", error as Error);
    }

    enableStandby();

    await sleep(750);
    await navigateTo({ name: "engine-overview" });
}

async function signinByDatabase() {
    try {
        await executeSigninByDatabase();
    } catch {
        // The stored key is gone or no longer valid — fall back to picking a file.
        hasStoredKey.value = false;

        return fileDialog.open();
    }

    enableStandby();

    await sleep(750);
    await navigateTo({ name: "engine-overview" });
}

function signin() {
    if (hasStoredKey.value) {
        return signinByDatabase();
    }

    fileDialog.open();
}

async function forgetStoredKey() {
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
