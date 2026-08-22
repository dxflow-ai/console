import { ViewClone, ActionConcurrent } from "@diphyx/harlemify/runtime";

export const hubStore = createStore({
    name: "hub",
    model({ many }) {
        const list = many(hubWorkflowShape);

        return {
            list,
        };
    },
    view({ from }) {
        const list = from(
            "list",
            (items) => {
                return items.sort((first, second) => {
                    return first.name.localeCompare(second.name);
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
        const search = handler<{ query?: string }, HubWorkflow[]>(
            async ({ model, payload }) => {
                const { call, read } = newHttpRequest("/api/workflow/hub/search/");

                const callError = await call({
                    query: {
                        query: payload.query,
                    },
                });

                if (callError) {
                    throw callError;
                }

                const workflows: HubWorkflow[] = [];
                const readError = await read((chunk) => {
                    if (chunk.isEntity) {
                        workflows.push(chunk.payload);
                    }
                });

                if (readError) {
                    throw readError;
                }

                model.list.set(workflows);

                return workflows;
            },
            {
                concurrent: ActionConcurrent.SKIP,
            },
        );

        const reset = handler(async ({ model }) => {
            model.list.reset();
        });

        return {
            search,
            reset,
        };
    },
});
