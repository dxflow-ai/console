<template>
    <ExplorerSection title="Shells" :expanded="props.expanded" :empty="!shells.length" :menu="menu" @toggle="toggle">
        <template #actions>
            <UiButton
                icon="i-mingcute:refresh-2-line"
                size="xs"
                variant="link"
                color="neutral"
                class="pr-0!"
                :loading="loading || creating || pruning"
                :ui="{
                    leadingIcon: 'size-3.5',
                }"
                @click="load()"
                square
            />
        </template>
        <template #empty>
            <Empty
                icon="i-hugeicons:command-line"
                description="Sessions opened or resumed here"
                :title="loading ? 'Loading shells' : 'No shells yet'"
                :loading="loading"
            >
                <template #action>
                    <UiButton
                        class="underline"
                        size="xs"
                        variant="link"
                        color="neutral"
                        label="New shell"
                        :loading="creating"
                        :disabled="loading"
                        @click="createShell()"
                    />
                </template>
            </Empty>
        </template>
        <template v-for="shell in shells" :key="shell.identity">
            <ShellNode :shell="shell" @open="onOpen" />
        </template>
    </ExplorerSection>
</template>

<script lang="ts" setup>
import { sleep } from "radash";

import type { ContextMenuItem } from "@nuxt/ui";

const props = defineProps({
    expanded: {
        type: Boolean,
        default: true,
    },
});

const emit = defineEmits({
    open(payload: { shell: Shell }) {
        return true;
    },
    toggle() {
        return true;
    },
});

const { data: shells } = useStoreView(shellStore, "list");

const { execute: executeGet, loading } = useStoreAction(shellStore, "get", {
    isolated: true,
});

const { create, creating, pruning } = useShellActions();

const menu = computed(() => {
    const output: ContextMenuItem[] = [
        {
            label: "New shell",
            onSelect() {
                createShell();
            },
        },
    ];

    return output;
});

function toggle() {
    emit("toggle");
}

function onOpen(payload: { shell: Shell }) {
    emit("open", payload);
}

async function load(delay?: number) {
    if (delay) {
        await sleep(delay);
    }

    try {
        await executeGet();
    } catch (error) {
        return dangerToast("Failed to load shells", error as Error);
    }
}

async function createShell() {
    const shell = await create();
    if (shell) {
        onOpen({
            shell,
        });
    }
}

onMounted(() => {
    load(500);
});
</script>
