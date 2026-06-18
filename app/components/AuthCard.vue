<template>
    <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="scale-95 opacity-0"
        enter-to-class="scale-100 opacity-100"
        appear
    >
        <div class="flex w-full flex-col overflow-hidden rounded-md border border-default">
            <div class="flex items-center gap-2.5 border-b border-default bg-elevated/40 px-4 py-3">
                <div class="flex size-9 shrink-0 items-center justify-center rounded bg-elevated">
                    <BrandMark class="size-5" />
                </div>
                <div class="flex flex-col">
                    <span class="font-semibold text-default">dxflow</span>
                    <span class="text-xs text-muted -mt-1.5">Console</span>
                </div>
            </div>
            <div class="flex flex-col gap-4 p-4">
                <div class="flex flex-col gap-0.5">
                    <span class="font-semibold text-default">{{ title }}</span>
                    <span class="text-xs text-muted">
                        <template v-if="hasStoredKey && provided">
                            <span>Session expired</span>
                            <RelativeTime class="ml-1" :timestamp="expiration" />
                        </template>
                        <template v-else>
                            <span>Authenticate with your private key</span>
                        </template>
                    </span>
                </div>
                <div class="flex flex-col gap-2">
                    <UiButton :loading="signing" :label="title" @click="signin()" block />
                    <template v-if="hasStoredKey">
                        <UiButton
                            label="Use a different key"
                            variant="soft"
                            color="neutral"
                            :disabled="signing"
                            @click="forgetStoredKey()"
                            block
                        />
                    </template>
                </div>
            </div>
        </div>
    </Transition>
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

    await navigateTo({
        name: "index",
    });
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

    await navigateTo({
        name: "index",
    });
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
