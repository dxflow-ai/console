<template>
    <div class="flex min-h-0 flex-1 flex-col">
        <div class="flex h-8 shrink-0 items-center overflow-x-auto border-b border-default">
            <template v-for="shell in shells" :key="shell.identity">
                <div
                    class="flex h-full shrink-0 cursor-pointer items-center gap-1.5 border-r border-default px-3 text-sm"
                    :class="
                        shell.identity === activeKey ? 'bg-elevated text-default' : 'text-muted hover:bg-elevated/50'
                    "
                    @click="setActive(shell.identity)"
                >
                    <UiIcon name="i-mingcute:terminal-line" class="size-4 shrink-0" />
                    <span class="max-w-24 truncate">{{ shell.identity }}</span>
                    <StatusDot :status="shell.state" />
                    <UiIcon
                        name="i-mingcute:close-line"
                        class="size-3.5 shrink-0 text-muted hover:text-default"
                        @click.stop="removeShell(shell.identity)"
                    />
                </div>
            </template>

            <div class="flex-1" />

            <UiTooltip
                :text="panelFull ? 'Restore Panel' : 'Full Screen'"
                :delay-duration="500"
                :content="{
                    side: 'top',
                }"
            >
                <UiButton
                    size="xs"
                    variant="ghost"
                    color="neutral"
                    :icon="panelFull ? 'i-mingcute:fullscreen-exit-line' : 'i-mingcute:fullscreen-line'"
                    @click="togglePanelFull()"
                    square
                />
            </UiTooltip>

            <UiTooltip
                text="New Shell"
                :delay-duration="500"
                :content="{
                    side: 'top',
                }"
            >
                <UiButton
                    icon="i-mingcute:add-line"
                    size="xs"
                    variant="ghost"
                    color="neutral"
                    :loading="creating"
                    @click="createShell()"
                    square
                />
            </UiTooltip>
        </div>

        <div class="min-h-0 flex-1">
            <template v-if="activeShell">
                <Terminal :key="activeShell.identity" class="size-full" :identity="activeShell.identity" />
            </template>
            <template v-else>
                <div class="flex h-full items-center justify-center text-xs text-dimmed">
                    <span>No shells</span>
                </div>
            </template>
        </div>
    </div>
</template>

<script lang="ts" setup>
const { data: shells } = useStoreView(shellStore, "list");

const { panelFull, togglePanelFull } = useWorkspace();

const activeKey = ref<MaybeString>();
const creating = ref(false);

const activeShell = computed(() => {
    return shells.value.find((shell) => {
        return shell.identity === activeKey.value;
    });
});

function setActive(key: string) {
    activeKey.value = key;
}

async function createShell() {
    creating.value = true;

    try {
        const shell = await shellStore.action.create();

        if (shell) {
            activeKey.value = shell.identity;
        }
    } catch (error) {
        dangerToast("Failed to create shell", error as Error);
    }

    creating.value = false;
}

async function removeShell(identity: string) {
    try {
        await shellStore.action.removeById({ payload: { identity } });
    } catch (error) {
        return dangerToast("Failed to remove shell", error as Error);
    }

    if (activeKey.value === identity) {
        activeKey.value = shells.value[0]?.identity;
    }
}

async function load() {
    try {
        await shellStore.action.get();
    } catch (error) {
        return dangerToast("Failed to load shells", error as Error);
    }

    if (!activeKey.value && shells.value.length) {
        activeKey.value = shells.value[0].identity;
    }
}

onMounted(() => {
    load();
});
</script>
