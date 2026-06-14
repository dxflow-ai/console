<template>
    <UiCard variant="subtle">
        <template #header>
            <div class="flex items-center justify-between gap-8">
                <div class="flex items-center gap-3">
                    <UiIcon name="i-mingcute:user-1-line" class="size-6 text-primary-500" />
                    <div class="flex flex-col">
                        <div class="flex items-center gap-2">
                            <span class="font-bold">{{ account.name || "Unnamed" }}</span>
                            <UiBadge :color="authenticatorColor" size="sm" variant="soft">
                                <span class="capitalize">{{ account.authenticator }}</span>
                            </UiBadge>
                            <template v-if="account.disabled">
                                <UiBadge size="sm" variant="soft" color="red">
                                    <span>Disabled</span>
                                </UiBadge>
                            </template>
                        </div>
                        <span class="text-xs text-muted">{{ account.email }}</span>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <UiTooltip :delay-duration="500" text="Delete Account">
                        <UiButton
                            :ui="{
                                base: 'rounded-sm',
                            }"
                            variant="soft"
                            color="red"
                            @click="$emit('delete')"
                            square
                        >
                            <UiIcon name="i-mingcute:delete-2-line" />
                            <Loading :active="deleting" />
                        </UiButton>
                    </UiTooltip>
                </div>
            </div>
        </template>
        <div class="flex flex-col gap-4">
            <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div class="flex flex-col gap-1">
                    <span class="text-xs text-muted">Identity</span>
                    <TruncateText :value="account.identity" class="font-mono text-sm" />
                </div>
                <div class="flex flex-col gap-1">
                    <span class="text-xs text-muted">Email</span>
                    <TruncateText :value="account.email" class="text-sm" />
                </div>
                <div class="flex flex-col gap-1">
                    <span class="text-xs text-muted">Created</span>
                    <DateLabel
                        :timestamp="account.created_at"
                        class="text-sm"
                        month="short"
                        day="numeric"
                        year="numeric"
                    />
                </div>
            </div>
        </div>
    </UiCard>
</template>

<script lang="ts" setup>
import DateLabel from "~/components/DateLabel.vue";
import Loading from "~/components/Loading.vue";
import TruncateText from "~/components/TruncateText.vue";

const props = defineProps({
    index: {
        type: Number,
        required: true,
    },
    account: {
        type: Object as PropType<Account>,
        required: true,
    },
    deleting: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits({
    delete: null,
});

const authenticatorColor = computed(() => {
    const colors: Record<string, string> = {
        google: "red",
        stripe: "violet",
    };
    return colors[props.account.authenticator] || "neutral";
});
</script>
