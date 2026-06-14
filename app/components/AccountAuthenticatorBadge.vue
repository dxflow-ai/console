<template>
    <UiBadge
        :ui="{
            base: 'pl-2 pr-2.5 py-1 rounded-full select-none',
        }"
        color="neutral"
        variant="outline"
        size="xs"
    >
        <div class="flex items-center gap-1.5">
            <div :class="computedColor" class="relative flex items-center justify-center rounded-full size-2">
                <span class="rounded-full size-1 bg-default" />
            </div>
            <span class="relative text-xs capitalize top-[-0.5px]">
                <small>{{ props.authenticator }}</small>
            </span>
        </div>
    </UiBadge>
</template>

<script lang="ts" setup>
const props = defineProps({
    authenticator: {
        type: String,
        required: true,
    },
});

const colors: Record<string, string> = {
    local: "bg-cyan-500",
    oauth: "bg-green-500",
    saml: "bg-amber-500",
};
const computedColor = computed(() => {
    return colors[props.authenticator] ?? "bg-neutral-500";
});
</script>
