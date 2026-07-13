<template>
    <ExplorerSection
        title="Agent sessions"
        :expanded="props.expanded"
        :empty="!sessions.length"
        :menu="menu"
        @toggle="toggle"
    >
        <template #actions>
            <UiButton
                icon="i-mingcute:refresh-2-line"
                size="xs"
                variant="link"
                color="neutral"
                class="pr-0!"
                :loading="loading || creating"
                :ui="{
                    leadingIcon: 'size-3.5',
                }"
                @click="load()"
                square
            />
        </template>
        <template #empty>
            <Empty
                icon="i-hugeicons:sparkles"
                description="Sessions to create and operate workflows here"
                :title="loading ? 'Loading sessions' : 'No sessions yet'"
                :loading="loading"
            >
                <template #action>
                    <UiButton
                        class="underline"
                        size="xs"
                        variant="link"
                        color="neutral"
                        label="New session"
                        :loading="creating"
                        :disabled="loading"
                        @click="createSession()"
                    />
                </template>
            </Empty>
        </template>
        <template v-for="session in sessions" :key="session.identity">
            <div class="px-1">
                <ContextMenu :items="nodeMenu(session)">
                    <div
                        class="flex w-full items-center gap-1.5 rounded-sm py-1.5 pr-2 pl-2 text-xs hover:bg-elevated"
                        :class="{
                            'pointer-events-none': isBusy(session.identity),
                        }"
                        @click="onOpen({ session })"
                    >
                        <UiIcon
                            class="size-3 shrink-0 text-muted"
                            :class="{
                                'animate-spin': isBusy(session.identity),
                            }"
                            :name="isBusy(session.identity) ? 'i-mingcute:loading-3-fill' : 'i-hugeicons:sparkles'"
                        />
                        <div class="flex min-w-0 flex-1 items-center gap-1.5">
                            <span class="shrink-0 truncate">{{ session.identity }}</span>
                            <template v-if="session.input">
                                <span class="min-w-0 max-w-28 flex-1 truncate text-muted" :title="session.input">
                                    {{ session.input }}
                                </span>
                            </template>
                        </div>
                        <small class="shrink-0 text-muted">
                            <RelativeTime :timestamp="session.created_at" />
                        </small>
                    </div>
                </ContextMenu>
            </div>
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
    open(payload: { session: AgentSession }) {
        return true;
    },
    toggle() {
        return true;
    },
});

const { data: sessions } = useStoreView(agentStore, "list");

const { execute: executeGet, loading } = useStoreAction(agentStore, "get", {
    isolated: true,
});

const { create, creating, isBusy, remove } = useAgentActions();

const menu = computed(() => {
    const output: ContextMenuItem[] = [
        {
            label: "New session",
            onSelect() {
                createSession();
            },
        },
    ];

    return output;
});

function toggle() {
    emit("toggle");
}

function onOpen(payload: { session: AgentSession }) {
    emit("open", payload);
}

function nodeMenu(session: AgentSession) {
    const output: ContextMenuItem[] = [
        {
            label: "Delete",
            onSelect() {
                remove(session.identity);
            },
        },
    ];

    return output;
}

async function load(delay?: number) {
    if (delay) {
        await sleep(delay);
    }

    try {
        await executeGet();
    } catch (error) {
        return dangerToast("Failed to load sessions", error as Error);
    }
}

async function createSession() {
    const session = await create();
    if (session) {
        onOpen({
            session,
        });
    }
}

onMounted(() => {
    load(500);
});
</script>
