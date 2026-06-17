<template>
    <UiPopover
        :content="{
            align: 'end',
            side: 'bottom',
            sideOffset: 6,
        }"
    >
        <button type="button" class="max-w-48 truncate text-muted hover:text-default">
            <span>{{ identity }}</span>
        </button>
        <template #content>
            <div class="flex w-60 flex-col gap-2 p-2 text-xs">
                <ConsoleInfoCard title="Session">
                    <ConsoleInfoRow label="User" :value="identity || '—'" />
                </ConsoleInfoCard>
                <template v-if="permissions.length">
                    <ConsoleInfoCard title="Permissions">
                        <div class="flex flex-wrap gap-1 py-0.5">
                            <template v-for="permission in permissions" :key="permission">
                                <UiBadge variant="soft" color="neutral" size="sm">
                                    <span>{{ permission }}</span>
                                </UiBadge>
                            </template>
                        </div>
                    </ConsoleInfoCard>
                </template>
            </div>
        </template>
    </UiPopover>
    <UiButton
        label="Sign Out"
        size="sm"
        variant="link"
        color="red"
        :ui="{
            base: 'px-0 focus-visible:ring-0 focus:outline-none',
        }"
        @click="confirmSignout.open()"
    />
</template>

<script lang="ts" setup>
import { sleep } from "radash";
import { enableStandby } from "~/components/Standby.vue";

const session = useSession();

const { execute: executeSignout } = useStoreAction(sessionStore, "signout");

const confirmSignout = useConfirmToast({
    id: "signout-confirm",
    icon: "i-mingcute:exit-line",
    color: "neutral",
    title() {
        return "Sign Out";
    },
    description() {
        return "Are you sure you want to sign out?";
    },
    async confirm() {
        enableStandby();

        await sleep(750);
        await executeSignout();

        await sleep(250);

        await navigateTo({
            name: "auth",
        });
    },
});

const identity = computed(() => {
    return session.session.value.identity;
});

const license = computed(() => {
    return engineStore.view.license.value;
});

const permissions = computed(() => {
    return Object.keys(license.value.permission ?? {});
});
</script>
