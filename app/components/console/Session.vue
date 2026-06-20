<template>
    <div class="flex items-center gap-2">
        <div class="text-xs text-dimmed">
            <span>{{ authorized ? "Expires" : "Expired" }}</span>
            <RelativeTime :timestamp="expiration" />
        </div>
        <UiButton
            icon="i-mingcute:exit-line"
            size="xs"
            variant="link"
            color="neutral"
            class="pr-0!"
            @click="signout()"
            square
        />
    </div>
</template>

<script lang="ts" setup>
const { expiration, authorized } = useSession();
const { signout } = useSessionActions();
</script>
