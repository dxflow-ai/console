<template>
    <div class="flex flex-col gap-4 text-xs">
        <div class="flex items-center gap-3">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-elevated">
                <UiIcon name="i-mingcute:certificate-line" class="size-5 text-muted" />
            </div>
            <div class="flex min-w-0 flex-col">
                <span class="truncate text-sm font-semibold text-default">{{ license.name || "—" }}</span>
                <span class="truncate text-muted">{{ license.owner || "—" }}</span>
            </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-1 rounded-md bg-elevated/40 p-3">
                <span class="text-xs tracking-wide text-dimmed uppercase">Starts</span>
                <span class="text-default">
                    <template v-if="license.starts">
                        <DateLabel year="numeric" month="short" day="numeric" :timestamp="license.starts" />
                    </template>
                    <template v-else>—</template>
                </span>
            </div>
            <div class="flex flex-col gap-1 rounded-md bg-elevated/40 p-3">
                <span class="text-xs tracking-wide text-dimmed uppercase">Expires</span>
                <span class="text-default">
                    <template v-if="license.expires">
                        <DateLabel year="numeric" month="short" day="numeric" :timestamp="license.expires" />
                    </template>
                    <template v-else>—</template>
                </span>
            </div>
        </div>
        <template v-if="permissions.length">
            <div class="flex flex-col gap-2">
                <span class="text-xs tracking-wide text-dimmed uppercase">Permissions</span>
                <div class="flex flex-wrap gap-1.5">
                    <template v-for="name in permissions" :key="name">
                        <UiBadge color="primary" variant="soft" size="sm" class="capitalize">
                            <span>{{ name }}</span>
                        </UiBadge>
                    </template>
                </div>
            </div>
        </template>
    </div>
</template>

<script lang="ts" setup>
const license = computed(() => {
    return engineStore.view.license.value;
});

const permissions = computed(() => {
    return Object.keys(license.value.permission ?? {});
});
</script>
