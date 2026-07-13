import { ViewClone, ActionConcurrent } from "@diphyx/harlemify/runtime";

export const agentStore = createStore({
    name: "agent",
    model({ many }) {
        const list = many(agentSessionShape);

        return {
            list,
        };
    },
    view({ from }) {
        const list = from(
            "list",
            (items) => {
                return items.sort((first, second) => {
                    return second.created_at - first.created_at;
                });
            },
            {
                clone: ViewClone.SHALLOW,
            },
        );

        return {
            list,
        };
    },
    action({ handler }) {
        const get = handler<unknown, AgentSession[]>(
            async ({ model }) => {
                const { call, read } = newHttpRequest("/api/agent/session/");

                const callError = await call();
                if (callError) {
                    throw callError;
                }

                const sessions: AgentSession[] = [];
                const readError = await read((chunk) => {
                    if (chunk.isEntity) {
                        sessions.push(chunk.payload);
                    }
                });

                if (readError) {
                    throw readError;
                }

                model.list.set(sessions);

                return sessions;
            },
            {
                concurrent: ActionConcurrent.SKIP,
            },
        );

        const getById = handler<{ identity: string }, AgentSessionDetail | null>(
            async ({ payload }) => {
                const { call, read } = newHttpRequest("/api/agent/session/get/");

                const callError = await call({
                    query: {
                        identity: payload.identity,
                    },
                });

                if (callError) {
                    throw callError;
                }

                let session: AgentSessionDetail | null = null;
                const readError = await read((chunk) => {
                    if (chunk.isEntity) {
                        session = chunk.payload;
                    }
                });

                if (readError) {
                    throw readError;
                }

                return session;
            },
            {
                concurrent: ActionConcurrent.CANCEL,
            },
        );

        const create = handler<{ identity?: string; workflow?: string } | undefined, AgentSession | null>(
            async ({ model, payload }) => {
                const { call, read } = newHttpRequest("/api/agent/session/");

                const callError = await call({
                    method: "POST",
                    body: {
                        identity: payload?.identity,
                        workflow: payload?.workflow,
                    },
                });

                if (callError) {
                    throw callError;
                }

                let session: AgentSession | null = null;
                const readError = await read((chunk) => {
                    if (chunk.isEntity) {
                        session = chunk.payload;
                    }
                });

                if (readError) {
                    throw readError;
                }

                if (session) {
                    model.list.add(session, {
                        prepend: true,
                    });
                }

                return session;
            },
            {
                concurrent: ActionConcurrent.BLOCK,
            },
        );

        const prompt = handler<{ identity: string; message: string; onReply: (reply: AgentReply) => void }>(
            async ({ payload }) => {
                const { call, read } = newHttpRequest("/api/agent/session/prompt/");

                const callError = await call({
                    method: "POST",
                    body: {
                        identity: payload.identity,
                        message: payload.message,
                    },
                });

                if (callError) {
                    throw callError;
                }

                const readError = await read((chunk) => {
                    if (chunk.isEntity) {
                        payload.onReply(chunk.payload);
                    }
                });

                if (readError) {
                    throw readError;
                }
            },
            {
                concurrent: ActionConcurrent.BLOCK,
            },
        );

        const removeById = handler<{ identity: string }>(
            async ({ model, payload }) => {
                const { call, read } = newHttpRequest("/api/agent/session/");

                const callError = await call({
                    method: "DELETE",
                    query: {
                        identity: payload.identity,
                    },
                });

                if (callError) {
                    throw callError;
                }

                const readError = await read();
                if (readError) {
                    throw readError;
                }

                model.list.remove({
                    identity: payload.identity,
                });
            },
            {
                concurrent: ActionConcurrent.BLOCK,
            },
        );

        const reset = handler(async ({ model }) => {
            model.list.reset();
        });

        return {
            get,
            getById,
            create,
            prompt,
            removeById,
            reset,
        };
    },
});
