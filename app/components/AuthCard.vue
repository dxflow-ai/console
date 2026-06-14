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
                <TypeAnimate :value="title" />
            </div>
            <div class="animate-fade">
                <div class="flex items-center text-sm opacity-65 gap-1">
                    <template v-if="provided">
                        <span>Expired</span>
                        <RelativeTime :timestamp="auth.payload.value.expiration" />
                    </template>
                    <template v-else>
                        <span>Using Your Private Key</span>
                    </template>
                </div>
            </div>
            <div class="flex mt-3 flex-col items-center gap-2">
                <Animate
                    :attributes="{
                        y: [20, 0],
                        opacity: [0, 1],
                    }"
                    :transition="{
                        delay: 250,
                        ease: 'backInOut',
                    }"
                >
                    <UiButton :disabled="signing" size="sm" @click="signin()">
                        <template v-if="provided">
                            <span>Sign-In Again</span>
                        </template>
                        <template v-else>
                            <span>Sign-In</span>
                        </template>
                        <Loading :active="signing" />
                    </UiButton>
                </Animate>
                <template v-if="provided">
                    <Animate
                        :attributes="{
                            y: [20, 0],
                            opacity: [0, 1],
                        }"
                        :transition="{
                            delay: 500,
                            ease: 'backInOut',
                        }"
                    >
                        <UiButton :disabled="signing" variant="soft" size="sm" color="neutral" @click="signout()">
                            <span>Sign-Out</span>
                        </UiButton>
                    </Animate>
                </template>
            </div>
        </div>
    </UiCard>
</template>

<script lang="ts" setup>
import Animate from "~/components/Animate.vue";
import Loading from "~/components/Loading.vue";
import RelativeTime from "~/components/RelativeTime.vue";
import TypeAnimate from "~/components/TypeAnimate.vue";

const auth = useAuth();

const fileDialog = useFileDialog({
    multiple: false,
    reset: true,
    accept: ".pem,.key",
});

const signing = ref(false);
const provided = ref(auth.provided.value);

const title = computed(() => {
    if (!auth.provided.value) {
        return "Sign In";
    }

    return "Sign In Again";
});

watchDebounced(
    () => {
        return auth.provided.value;
    },
    (value) => {
        provided.value = value;
    },
    {
        debounce: 250,
    },
);

async function signinByFile(file: File) {
    signing.value = true;

    const signinError = await auth.signinByFile(file);

    signing.value = false;

    if (signinError) {
        dangerToast("Failed to sign-in", signinError);
    }
}

async function signinByDatabase() {
    signing.value = true;

    const signinError = await auth.signinByDatabase();

    signing.value = false;

    if (signinError) {
        dangerToast("Failed to sign-in", signinError);
        signout();
    }
}

async function signin() {
    if (auth.provided.value) {
        return signinByDatabase();
    }

    fileDialog.open();
}

function signout() {
    auth.signout();
}

fileDialog.onChange((files) => {
    if (files?.length) {
        signinByFile(files[0] as File);
    }
});
</script>
