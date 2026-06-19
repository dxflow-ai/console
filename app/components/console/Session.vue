<template>
    <UiButton
        label="Sign Out"
        size="xs"
        variant="link"
        color="neutral"
        class="pr-0!"
        @click="confirmSignout.open()"
        square
    />
</template>

<script lang="ts" setup>
import { sleep } from "radash";
import { enableStandby } from "~/components/Standby.vue";

const { execute: executeSignout } = useStoreAction(sessionStore, "signout");

const confirmSignout = useConfirmToast({
    id: "signout-confirm",
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
</script>
