import { ViewClone, ActionConcurrent } from "@diphyx/harlemify/runtime";
import { isArray } from "radash";

export const shellStore = createStore({
    name: "shell",
    model({ many }) {
        const list = many(shellShape);
        return {
            list,
        };
    },
    view({ from }) {
        const ordered = from(
            "list",
            (items) => {
                return items.sort((first, second) => {
                    return second.created_at - first.created_at;
                });
            },
            { clone: ViewClone.SHALLOW },
        );
        return {
            ordered,
        };
    },
    action({ handler }) {
        const load = handler<unknown, Shell[]>(
            async ({ model }) => {
                const request = newHttpRequest("/api/shell/");
                const callError = await request.call();
                ensure(callError);

                const shells: Shell[] = [];
                const readError = await request.read((chunk) => {
                    if (chunk.isEntity) {
                        shells.push(chunk.payload);
                        model.list.add(chunk.payload, { unique: true });
                    }
                });
                ensure(readError);

                return shells;
            },
            {
                concurrent: ActionConcurrent.SKIP,
            },
        );

        const create = handler<{ identity?: string; path?: string; args?: string[] } | undefined, Shell | null>(
            async ({ model, payload }) => {
                const request = newHttpRequest("/api/shell/");
                const callError = await request.call({
                    method: "POST",
                    body: {
                        identity: payload?.identity,
                        path: payload?.path,
                        args: payload?.args,
                    },
                });
                ensure(callError);

                let shell: Shell | null = null;
                const readError = await request.read((chunk) => {
                    if (chunk.isEntity) {
                        shell = chunk.payload;
                    }
                });
                ensure(readError);

                if (shell) {
                    model.list.add(shell, { prepend: true });
                }

                return shell;
            },
            {
                concurrent: ActionConcurrent.BLOCK,
            },
        );

        const resize = handler<{ identity: string; columns: number; rows: number }>(
            async ({ model, payload }) => {
                const request = newHttpRequest("/api/shell/resize/");
                const callError = await request.call({
                    method: "PUT",
                    body: {
                        identity: payload.identity,
                        columns: payload.columns,
                        rows: payload.rows,
                    },
                });
                ensure(callError);

                const readError = await request.read();
                ensure(readError);

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

        const execute = handler<{ identity: string }>(
            async ({ model, payload }) => {
                const request = newHttpRequest("/api/shell/execute/");
                const callError = await request.call({
                    method: "PUT",
                    body: {
                        identity: payload.identity,
                    },
                });
                ensure(callError);

                const readError = await request.read();
                ensure(readError);

                model.list.patch({
                    identity: payload.identity,
                    state: ShellState.EXECUTED,
                });
            },
            {
                concurrent: ActionConcurrent.BLOCK,
            },
        );

        const kill = handler<{ identity: string }>(
            async ({ model, payload }) => {
                const request = newHttpRequest("/api/shell/kill/");
                const callError = await request.call({
                    method: "PUT",
                    body: {
                        identity: payload.identity,
                    },
                });
                ensure(callError);

                const readError = await request.read();
                ensure(readError);

                model.list.patch({
                    identity: payload.identity,
                    state: ShellState.KILLED,
                });
            },
            {
                concurrent: ActionConcurrent.BLOCK,
            },
        );

        const remove = handler<{ identity: string }>(
            async ({ model, payload }) => {
                const request = newHttpRequest("/api/shell/");
                const callError = await request.call({
                    method: "DELETE",
                    query: {
                        identity: payload.identity,
                    },
                });
                ensure(callError);

                const readError = await request.read();
                ensure(readError);

                model.list.remove({ identity: payload.identity });
            },
            {
                concurrent: ActionConcurrent.BLOCK,
            },
        );

        const removeBatch = handler<{ identities: string[] }, Array<{ identity: string; error?: string }>>(
            async ({ model, payload }) => {
                const request = newHttpRequest("/api/shell/batch/");
                const callError = await request.call({
                    method: "DELETE",
                    body: {
                        identities: payload.identities,
                    },
                });
                ensure(callError);

                const results: Array<{ identity: string; error?: string }> = [];
                const readError = await request.read((chunk) => {
                    if (chunk.isEntity) {
                        results.push(chunk.payload);

                        if (!chunk.payload.error) {
                            model.list.remove({ identity: chunk.payload.identity });
                        }
                    }
                });
                ensure(readError);

                return results;
            },
            {
                concurrent: ActionConcurrent.BLOCK,
            },
        );

        const prune = handler<unknown, string[]>(
            async ({ model }) => {
                const request = newHttpRequest("/api/shell/prune/");
                const callError = await request.call({
                    method: "DELETE",
                });
                ensure(callError);

                const identities: string[] = [];
                const readError = await request.read((chunk) => {
                    if (chunk.isEntity) {
                        if (isArray(chunk.payload)) {
                            for (const identity of chunk.payload) {
                                identities.push(identity);
                                model.list.remove({ identity });
                            }
                        }
                    }
                });
                ensure(readError);

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
            load,
            create,
            resize,
            execute,
            kill,
            remove,
            removeBatch,
            prune,
            reset,
        };
    },
    compose({ action }) {
        async function createAndExecute(options?: { identity?: string; path?: string; args?: string[] }) {
            const shell = await action.create({ payload: options });
            if (shell) {
                await action.execute({ payload: { identity: shell.identity } });
            }
        }

        return {
            createAndExecute,
        };
    },
});
