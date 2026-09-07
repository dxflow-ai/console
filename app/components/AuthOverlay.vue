<template>
    <template v-if="!authorized">
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-default p-4">
            <div class="w-full max-w-sm">
                <div
                    class="relative flex w-full flex-col gap-6 overflow-hidden rounded-xl border border-default bg-default p-6"
                >
                    <div
                        class="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/60 to-transparent"
                    />
                    <div
                        class="pointer-events-none absolute -top-20 left-1/2 h-40 w-80 -translate-x-1/2 rounded-full bg-primary/10 blur-[80px]"
                    />
                    <div class="relative flex flex-col items-center gap-4 text-center">
                        <BrandMark class="size-8" />
                        <div class="flex min-w-0 flex-col gap-1.5">
                            <span class="text-base font-semibold tracking-tight text-highlighted">{{ title }}</span>
                            <span class="truncate text-sm text-muted">
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
                    <div class="relative flex flex-col gap-3">
                        <UiSelect
                            v-model="method"
                            class="w-full"
                            size="lg"
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
                        <template v-if="isCodeMethod">
                            <UiInput
                                v-model="code"
                                class="w-full"
                                size="lg"
                                placeholder="H7KP3XQA"
                                :disabled="signing"
                                :maxlength="9"
                                :ui="{
                                    base: 'font-medium tracking-widest uppercase text-default',
                                }"
                                @keydown.enter="signin()"
                            />
                        </template>
                        <template v-else>
                            <UiSelect
                                v-model="lifetime"
                                class="w-full"
                                size="lg"
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
                        </template>
                    </div>
                    <div class="relative grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-lg bg-muted/50 p-3 text-xs">
                        <span class="text-dimmed">Engine</span>
                        <span class="truncate text-end font-mono text-muted">{{ engine }}</span>
                        <template v-if="!isCodeMethod">
                            <span class="text-dimmed">Signs in until</span>
                            <span class="truncate text-end font-mono text-muted">
                                <DateLabel hour="2-digit" minute="2-digit" :timestamp="until" :weekday="untilWeekday" />
                            </span>
                            <span class="text-dimmed">Stored key</span>
                            <span class="truncate text-end font-mono text-muted">{{ storedKey }}</span>
                        </template>
                    </div>
                    <div class="relative flex flex-col gap-2">
                        <UiButton size="lg" :loading="signing" :label="title" @click="signin()" block autofocus />
                        <template v-if="hasStoredKey && !isCodeMethod">
                            <UiButton
                                size="lg"
                                variant="ghost"
                                color="neutral"
                                label="Forget key"
                                :disabled="signing"
                                @click="signout()"
                                block
                            />
                        </template>
                    </div>
                    <div class="relative flex items-center justify-center gap-2 text-xs">
                        <UiIcon class="size-3.5 shrink-0 text-dimmed" :name="hintIcon" :class="hintIconClass" />
                        <template v-if="requested">
                            <span class="truncate text-dimmed">Waiting for approval on the engine</span>
                        </template>
                        <template v-else-if="isCodeMethod">
                            <span class="truncate text-dimmed">Run 'dxflow engine pair' for a code</span>
                        </template>
                        <template v-else-if="provided">
                            <span class="truncate text-dimmed">Using your saved key</span>
                        </template>
                        <template v-else>
                            <span class="truncate text-dimmed">Key stays on this device</span>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </template>
</template>

<script lang="ts" setup>
const { provided, expiration, authorized } = useSession();
const { reachable, pending, probed } = useEngineChallenge({
    enabled() {
        return !authorized.value;
    },
});

const timestamp = useSharedTimestamp();
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

const engine = computed(() => {
    return window.location.host;
});

const reachability = computed(() => {
    if (pending.value || !probed.value) {
        return "checking";
    }

    return reachable.value ? "yes" : "no";
});

const untilHours = computed(() => {
    return Number(lifetime.value.replace("h", "")) || 0;
});

const until = computed(() => {
    return timestamp.value + untilHours.value * 3600000;
});

const untilWeekday = computed<"short" | undefined>(() => {
    return untilHours.value >= 24 ? "short" : undefined;
});

const storedKey = computed(() => {
    return hasStoredKey.value ? "on this device" : "none";
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
