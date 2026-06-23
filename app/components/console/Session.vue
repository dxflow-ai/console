<template>
    <div class="flex items-center gap-2">
        <template v-if="!isMobile">
            <div class="text-xs text-dimmed">
                <span>{{ authorized ? "Expires" : "Expired" }}</span>
                <RelativeTime :timestamp="expiration" />
            </div>
        </template>
        <UiButton
            icon="i-mingcute:open-door-line"
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
const { isMobile } = useWorkspace();
const { expiration, authorized } = useSession();
const { signout } = useSessionActions();
</script>
