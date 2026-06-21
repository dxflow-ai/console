import { isArray } from "radash";
import { ViewClone, ActionConcurrent } from "@diphyx/harlemify/runtime";

export const shellStore = createStore({
    name: "shell",
    model({ many }) {
        const list = many(shellShape);

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
        const get = handler<unknown, Shell[]>(
            async ({ model }) => {
                const { call, read } = newHttpRequest("/api/shell/");

                const callError = await call();
                if (callError) {
                    throw callError;
                }

                const shells: Shell[] = [];
                const readError = await read((chunk) => {
                    if (chunk.isEntity) {
                        shells.push(chunk.payload);
                    }
                });

                if (readError) {
                    throw readError;
                }

                model.list.set(shells);

                return shells;
            },
            {
                concurrent: ActionConcurrent.SKIP,
            },
        );

        const create = handler<{ identity?: string; path?: string; args?: string[] } | undefined, Shell | null>(
            async ({ model, payload }) => {
                const { call, read } = newHttpRequest("/api/shell/");

                const callError = await call({
                    method: "POST",
                    body: {
                        identity: payload?.identity,
                        path: payload?.path,
                        args: payload?.args,
                    },
                });

                if (callError) {
                    throw callError;
                }

                let shell: Shell | null = null;
                const readError = await read((chunk) => {
                    if (chunk.isEntity) {
                        shell = chunk.payload;
                    }
                });

                if (readError) {
                    throw readError;
                }

                if (shell) {
                    model.list.add(shell, {
                        prepend: true,
                    });
                }

                return shell;
            },
            {
                concurrent: ActionConcurrent.BLOCK,
            },
        );

        const resizeById = handler<{ identity: string; columns: number; rows: number }>(
            async ({ model, payload }) => {
                const { call, read } = newHttpRequest("/api/shell/resize/");

                const callError = await call({
                    method: "PUT",
                    body: {
                        identity: payload.identity,
                        columns: payload.columns,
                        rows: payload.rows,
                    },
                });

                if (callError) {
                    throw callError;
                }

                const readError = await read();
                if (readError) {
                    throw readError;
                }

                model.list.patch({
                    identity: payload.identity,
                    columns: payload.columns,
                    rows: payload.rows,
                });
            },
            {
                concurrent: ActionConcurrent.CANCEL,
            },
        );

        const executeById = handler<{ identity: string }>(
            async ({ model, payload }) => {
                const { call, read } = newHttpRequest("/api/shell/execute/");

                const callError = await call({
                    method: "PUT",
                    body: {
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

                model.list.patch({
                    identity: payload.identity,
                    state: ShellState.EXECUTED,
                });
            },
            {
                concurrent: ActionConcurrent.BLOCK,
            },
        );

        const killById = handler<{ identity: string }>(
            async ({ model, payload }) => {
                const { call, read } = newHttpRequest("/api/shell/kill/");

                const callError = await call({
                    method: "PUT",
                    body: {
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

                model.list.patch({
                    identity: payload.identity,
                    state: ShellState.KILLED,
                });
            },
            {
                concurrent: ActionConcurrent.BLOCK,
            },
        );

        const removeById = handler<{ identity: string }>(
            async ({ model, payload }) => {
                const { call, read } = newHttpRequest("/api/shell/");

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

        const prune = handler<unknown, string[]>(
            async ({ model }) => {
                const { call, read } = newHttpRequest("/api/shell/prune/");

                const callError = await call({
                    method: "DELETE",
                });

                if (callError) {
                    throw callError;
                }

                const identities: string[] = [];
                const readError = await read((chunk) => {
                    if (chunk.isEntity) {
                        const payload: string[] = isArray(chunk.payload) ? chunk.payload : [chunk.payload];

                        for (const identity of payload) {
                            identities.push(identity);

                            model.list.remove({
                                identity,
                            });
                        }
                    }
                });

                if (readError) {
                    throw readError;
                }

                return identities;
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
            create,
            resizeById,
            executeById,
            killById,
            removeById,
            prune,
            reset,
        };
    },
    compose({ action }) {
        async function createAndExecute(options?: { identity?: string; path?: string; args?: string[] }) {
            const shell = await action.create({
                payload: options,
            });

            if (shell) {
                await action.executeById({
                    payload: {
                        identity: shell.identity,
                    },
                });
            }
        }

        return {
            createAndExecute,
        };
    },
});
