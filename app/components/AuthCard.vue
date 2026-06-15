<template>
    <UiCard
        :ui="{
            body: 'flex flex-col items-center justify-center gap-4 !py-10',
        }"
    >
        <div class="relative size-16 text-primary-500">
            <UiIcon class="absolute inset-0 top-0.5 size-16" name="i-mingcute:shield-line" />
            <UiIcon class="absolute inset-4 size-8 animate-rotate-y" name="i-mingcute:fingerprint-line" />
        </div>
        <div class="flex flex-col items-center justify-center gap-3">
            <div class="text-lg font-bold">
                <span>{{ title }}</span>
            </div>
            <div class="animate-fade">
                <div class="flex items-center text-sm opacity-65 gap-1">
                    <template v-if="provided">
                        <span>Expired</span>
                        <RelativeTime :timestamp="expiration" />
                    </template>
                    <template v-else>
                        <span>Using Your Private Key</span>
                    </template>
                </div>
            </div>
            <div class="flex mt-3 flex-col items-center gap-2">
                <UiButton :loading="signing" size="sm" class="animate-fade-up animate-delay-250ms" @click="signin()">
                    <template v-if="provided">
                        <span>Sign-In Again</span>
                    </template>
                    <template v-else>
                        <span>Sign-In</span>
                    </template>
                </UiButton>
                <template v-if="provided">
                    <UiButton
                        :disabled="signing"
                        variant="soft"
                        size="sm"
                        color="neutral"
                        class="animate-fade-up animate-delay-500"
                        @click="signout()"
                    >
                        <span>Sign-Out</span>
                    </UiButton>
                </template>
            </div>
        </div>
    </UiCard>
</template>

<script lang="ts" setup>
import { sleep } from "radash";
import { enableStandby, disableStandby } from "~/components/Standby.vue";

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

const signing = computed(() => {
    return signingByFile.value || signingByDatabase.value;
});

const title = computed(() => {
    if (!provided.value) {
        return "Sign In";
    }

    return "Sign In Again";
});

async function signinByFile(file: File) {
    try {
        await executeSigninByFile({ payload: { file } });

        enableStandby();
        await sleep(750);
        disableStandby();
    } catch (error) {
        dangerToast("Failed to sign-in", error as Error);
    }
}

async function signinByDatabase() {
    try {
        await executeSigninByDatabase();

        enableStandby();
        await sleep(750);
        disableStandby();
    } catch (error) {
        dangerToast("Failed to sign-in", error as Error);
        signout();
    }
}

async function signin() {
    if (provided.value) {
        return signinByDatabase();
    }

    fileDialog.open();
}

function signout() {
    executeSignout();
}

fileDialog.onChange((files) => {
    if (files?.length) {
        signinByFile(files[0] as File);
    }
});
</script>
