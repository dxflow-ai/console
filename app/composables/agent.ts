// In-memory conversation state for the agent sidekick, keyed by session identity.
// Sessions come from the agent store; history and prompting go through useAgentActions.

const activeId = ref<string>();
const busy = ref(false);
const draft = ref("");
const conversations = ref<Record<string, AgentMessage[]>>({});
const usages = ref<Record<string, AgentUsage>>({});
const busyIdentities = ref<Set<string>>(new Set());

let sequence = 0;

function nextId(prefix: string) {
    sequence += 1;

    return `${prefix}:${sequence}`;
}

export function useAgent() {
    const selected = computed(() => {
        return Boolean(activeId.value);
    });

    const messages = computed(() => {
        const id = activeId.value;

        return id ? (conversations.value[id] ?? []) : [];
    });

    const usage = computed(() => {
        const id = activeId.value;

        return (id && usages.value[id]) || { input: 0, output: 0 };
    });

    function select(identity: string) {
        activeId.value = identity;

        if (!conversations.value[identity]) {
            conversations.value[identity] = [];
        }
    }

    function deselect() {
        activeId.value = undefined;
    }

    return {
        busy,
        draft,
        activeId,
        selected,
        messages,
        usage,
        select,
        deselect,
    };
}

export function useAgentActions() {
    const { activeId, deselect } = useAgent();

    const { execute: executeGetById, loading } = useStoreAction(agentStore, "getById", {
        isolated: true,
    });

    const { execute: executePrompt } = useStoreAction(agentStore, "prompt", {
        isolated: true,
    });

    const { execute: executeCreate, loading: creating } = useStoreAction(agentStore, "create", {
        isolated: true,
    });

    const { execute: executeRemove } = useStoreAction(agentStore, "removeById", {
        isolated: true,
    });

    function isBusy(identity: string) {
        return busyIdentities.value.has(identity);
    }

    async function withBusy<T>(identity: string, run: () => Promise<T>) {
        busyIdentities.value.add(identity);

        try {
            return await run();
        } finally {
            busyIdentities.value.delete(identity);
        }
    }

    function applyUsage(identity: string, usage: AgentSessionUsage) {
        usages.value[identity] = {
            input: usage.input,
            output: usage.output,
        };
    }

    async function refreshUsage(identity: string) {
        const session = await executeGetById({
            payload: {
                identity,
            },
        });

        if (session) {
            applyUsage(identity, session.usage);
        }
    }

    function createReplyHandler(list: AgentMessage[]) {
        let current: AgentMessage | undefined;

        function appendAssistant(content: string) {
            list.push({
                id: nextId("message"),
                role: "assistant",
                content,
                timestamp: Date.now(),
            });

            current = list[list.length - 1];

            return current;
        }

        return (reply: AgentReply) => {
            if (reply.type === "message") {
                if (reply.message) {
                    appendAssistant(reply.message);
                }

                return;
            }

            const message = current ?? appendAssistant("");

            if (!message.tools) {
                message.tools = [];
            }

            if (reply.type === "tool_run") {
                message.tools.push({
                    id: nextId("tool"),
                    name: reply.tool ?? "",
                    status: "running",
                });

                return;
            }

            const tool = message.tools[message.tools.length - 1];
            if (tool) {
                tool.status = reply.type === "tool_failed" ? "failed" : "success";
            }
        };
    }

    async function send(text: string) {
        const identity = activeId.value;
        const content = text.trim();
        if (!identity || !content || busy.value) {
            return;
        }

        if (!conversations.value[identity]) {
            conversations.value[identity] = [];
        }

        const list = conversations.value[identity];

        list.push({
            id: nextId("message"),
            role: "user",
            content,
            timestamp: Date.now(),
        });

        const handleReply = createReplyHandler(list);

        draft.value = "";
        busy.value = true;

        try {
            await executePrompt({
                payload: {
                    identity,
                    message: content,
                    onReply: handleReply,
                },
            });
        } catch (error) {
            dangerToast("Failed to reach the agent", error as Error);
        } finally {
            busy.value = false;

            try {
                await refreshUsage(identity);
            } catch {
                // usage is refreshed again on the next load
            }
        }
    }

    async function load(identity: string) {
        try {
            const session = await executeGetById({
                payload: {
                    identity,
                },
            });

            if (!session) {
                return;
            }

            conversations.value[identity] = session.history
                .filter((turn) => {
                    return (turn.role === "user" || turn.role === "model") && Boolean(turn.content);
                })
                .map((turn) => {
                    return {
                        id: nextId("message"),
                        role: turn.role === "user" ? "user" : "assistant",
                        content: turn.content ?? "",
                        timestamp: Date.now(),
                    };
                });

            applyUsage(identity, session.usage);
        } catch (error) {
            dangerToast("Failed to load session", error as Error);
        }
    }

    async function create(workflow?: string) {
        try {
            const session = await executeCreate({
                payload: {
                    workflow,
                },
            });

            return session ?? undefined;
        } catch (error) {
            dangerToast("Failed to create session", error as Error);
        }
    }

    async function remove(identity: string) {
        try {
            await withBusy(identity, () => {
                return executeRemove({
                    payload: {
                        identity,
                    },
                });
            });

            if (activeId.value === identity) {
                deselect();
            }
        } catch (error) {
            dangerToast("Failed to remove session", error as Error);
        }
    }

    return {
        loading,
        creating,
        isBusy,
        load,
        send,
        create,
        remove,
    };
}
