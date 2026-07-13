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

    const { execute: executeWorkflows } = useStoreAction(workflowStore, "get", {
        isolated: true,
    });

    const { execute: executeArtifacts } = useStoreAction(artifactStore, "list", {
        isolated: true,
    });

    const { openWorkflow } = useTabs();

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
        try {
            const session = await executeGetById({
                payload: {
                    identity,
                },
            });

            if (session) {
                applyUsage(identity, session.usage);
            }
        } catch {}
    }

    async function openCreatedWorkflow(identity: string, workflows: Workflow[]) {
        const session = await executeGetById({
            payload: {
                identity,
            },
        });

        const workflow = workflows.find((item) => {
            return item.identity === session?.workflow;
        });

        if (workflow) {
            openWorkflow({
                workflow,
            });
        }
    }

    async function runToolHook(identity: string, name: string) {
        try {
            switch (name) {
                case "upload": {
                    await executeArtifacts({
                        payload: {
                            directory: ".",
                        },
                    });

                    break;
                }
                case "create":
                case "start":
                case "stop": {
                    const workflows = await executeWorkflows();

                    if (name === "create" && workflows) {
                        await openCreatedWorkflow(identity, workflows);
                    }

                    break;
                }
            }
        } catch {
            // workflow and artifact updates are best-effort
        }
    }

    function appendAssistant(list: AgentMessage[], content: string) {
        list.push({
            id: nextId("message"),
            role: "assistant",
            content,
            timestamp: Date.now(),
        });

        return list[list.length - 1];
    }

    function applyReply(list: AgentMessage[], identity: string, reply: AgentReply) {
        if (reply.type === "message") {
            if (reply.message) {
                appendAssistant(list, reply.message);
            }

            return;
        }

        const last = list[list.length - 1];
        const message = last?.role === "assistant" ? last : appendAssistant(list, "");

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

        if (reply.type === "tool_success" && reply.tool) {
            void runToolHook(identity, reply.tool);
        }
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

        draft.value = "";
        busy.value = true;

        try {
            await executePrompt({
                payload: {
                    identity,
                    message: content,
                    onReply(reply) {
                        applyReply(list, identity, reply);
                    },
                },
            });
        } catch (error) {
            dangerToast("Failed to reach the agent", error as Error);
        } finally {
            busy.value = false;

            await refreshUsage(identity);
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

            const messages: AgentMessage[] = [];
            for (const turn of session.history) {
                if (turn.role !== "user" && turn.role !== "model") {
                    continue;
                }

                if (!turn.content) {
                    continue;
                }

                messages.push({
                    id: nextId("message"),
                    role: turn.role === "user" ? "user" : "assistant",
                    content: turn.content,
                    timestamp: Date.now(),
                });
            }

            conversations.value[identity] = messages;

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
