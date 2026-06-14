import { ViewClone, ActionConcurrent } from "@diphyx/harlemify/runtime";

export const accountStore = createStore({
    name: "account",
    model({ many }) {
        const list = many(accountShape);
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
        const load = handler<unknown, Account[]>(
            async ({ model }) => {
                const request = newHttpRequest("/api/account/");
                const callError = await request.call();
                ensure(callError);

                const accounts: Account[] = [];
                const readError = await request.read((chunk) => {
                    if (chunk.isEntity) {
                        accounts.push(chunk.payload);
                        model.list.add(chunk.payload, { unique: true });
                    }
                });
                ensure(readError);

                return accounts;
            },
            {
                concurrent: ActionConcurrent.SKIP,
            },
        );

        const create = handler<Partial<Account>, Account | null>(
            async ({ model, payload }) => {
                const request = newHttpRequest("/api/account/");
                const callError = await request.call({
                    method: "POST",
                    body: payload,
                });
                ensure(callError);

                let account: Account | null = null;
                const readError = await request.read((chunk) => {
                    if (chunk.isEntity) {
                        account = chunk.payload;
                    }
                });
                ensure(readError);

                if (account) {
                    model.list.add(account, {
                        prepend: true,
                    });
                }

                return account;
            },
            {
                concurrent: ActionConcurrent.BLOCK,
            },
        );

        const update = handler<Partial<Account>, Account | null>(
            async ({ model, payload }) => {
                const request = newHttpRequest("/api/account/");
                const callError = await request.call({
                    method: "PUT",
                    body: payload,
                });
                ensure(callError);

                let account: Account | null = null;
                const readError = await request.read((chunk) => {
                    if (chunk.isEntity) {
                        account = chunk.payload;
                    }
                });
                ensure(readError);

                if (account) {
                    model.list.patch(account);
                }

                return account;
            },
            {
                concurrent: ActionConcurrent.BLOCK,
            },
        );

        const remove = handler<{ identity: string }>(
            async ({ model, payload }) => {
                const request = newHttpRequest("/api/account/");
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
            { concurrent: ActionConcurrent.BLOCK },
        );

        const removeBatch = handler<{ identities: string[] }>(
            async ({ model, payload }) => {
                const request = newHttpRequest("/api/account/batch/");
                const callError = await request.call({
                    method: "DELETE",
                    body: {
                        identities: payload.identities,
                    },
                    timeout: 10000,
                });
                ensure(callError);

                const readError = await request.read((chunk) => {
                    if (chunk.isEntity && !chunk.payload.error) {
                        model.list.remove({ identity: chunk.payload.identity });
                    }
                });
                ensure(readError);
            },
            { concurrent: ActionConcurrent.BLOCK },
        );

        const reset = handler(async ({ model }) => {
            model.list.reset();
        });
        return {
            load,
            create,
            update,
            remove,
            removeBatch,
            reset,
        };
    },
});
