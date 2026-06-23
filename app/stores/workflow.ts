import { isArray } from "radash";
import { ModelManyKind, ViewClone, ActionConcurrent } from "@diphyx/harlemify/runtime";

export const workflowStore = createStore({
    name: "workflow",
    model({ many }) {
        const list = many(workflowShape);

        const steps = many(workflowStepShape, {
            kind: ModelManyKind.RECORD,
        });

        return {
            list,
            steps,
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

        const steps = from("steps");

        return {
            list,
            steps,
        };
    },
    action({ handler }) {
        const get = handler<unknown, Workflow[]>(
            async ({ model }) => {
                const { call, read } = newHttpRequest("/api/workflow/");

                const callError = await call();
                if (callError) {
                    throw callError;
                }

                const workflows: Workflow[] = [];
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

        const create = handler<
            {
                identity?: string;
                source: string;
                onMessage?: (message: string) => void;
                onError?: (error: string) => void;
            },
            Workflow | null
        >(
            async ({ model, payload }) => {
                const { call, read } = newHttpRequest("/api/workflow/");

                const callError = await call({
                    method: "POST",
                    query: {
                        identity: payload.identity,
                    },
                    body: payload.source,
                });

                if (callError) {
                    throw callError;
                }

                let workflow: Workflow | null = null;
                const readError = await read((chunk) => {
                    if (!chunk.isEntity) {
                        return;
                    }

                    if (chunk.isEntityWithTag("message")) {
                        payload.onMessage?.(chunk.payload);
                        return;
                    }

                    if (chunk.isEntityWithTag("error")) {
                        payload.onError?.(chunk.payload);
                        return;
                    }

                    workflow = chunk.payload;

                    model.list.add(chunk.payload, {
                        prepend: true,
                    });
                });

                if (readError) {
                    throw readError;
                }

                return workflow;
            },
            {
                concurrent: ActionConcurrent.BLOCK,
            },
        );

        const startById = handler<
            {
                identity: string;
                onMessage?: (message: string) => void;
                onError?: (error: string) => void;
            },
            Workflow | null
        >(
            async ({ model, payload }) => {
                const { call, read } = newHttpRequest("/api/workflow/start/");

                const callError = await call({
                    method: "PUT",
                    body: {
                        identity: payload.identity,
                    },
                });

                if (callError) {
                    throw callError;
                }

                let workflow: Workflow | null = null;
                const readError = await read((chunk) => {
                    if (!chunk.isEntity) {
                        return;
                    }

                    if (chunk.isEntityWithTag("message")) {
                        payload.onMessage?.(chunk.payload);
                        return;
                    }

                    if (chunk.isEntityWithTag("error")) {
                        payload.onError?.(chunk.payload);
                        return;
                    }

                    workflow = chunk.payload;
                    model.list.patch(chunk.payload);
                });

                if (readError) {
                    throw readError;
                }

                return workflow;
            },
            {
                concurrent: ActionConcurrent.BLOCK,
            },
        );

        const stopById = handler<
            {
                identity: string;
                onMessage?: (message: string) => void;
                onError?: (error: string) => void;
            },
            Workflow | null
        >(
            async ({ model, payload }) => {
                const { call, read } = newHttpRequest("/api/workflow/stop/");

                const callError = await call({
                    method: "PUT",
                    body: {
                        identity: payload.identity,
                    },
                });

                if (callError) {
                    throw callError;
                }

                let workflow: Workflow | null = null;
                const readError = await read((chunk) => {
                    if (!chunk.isEntity) {
                        return;
                    }

                    if (chunk.isEntityWithTag("message")) {
                        payload.onMessage?.(chunk.payload);
                        return;
                    }

                    if (chunk.isEntityWithTag("error")) {
                        payload.onError?.(chunk.payload);
                        return;
                    }

                    workflow = chunk.payload;
                    model.list.patch(chunk.payload);
                });

                if (readError) {
                    throw readError;
                }

                return workflow;
            },
            {
                concurrent: ActionConcurrent.BLOCK,
            },
        );

        const removeById = handler<{ identity: string }>(
            async ({ model, payload }) => {
                const { call, read } = newHttpRequest("/api/workflow/");

                const callError = await call({
                    method: "DELETE",
                    query: payload,
                });

                if (callError) {
                    throw callError;
                }

                const readError = await read(() => {});
                if (readError) {
                    throw readError;
                }

                model.list.remove({
                    identity: payload.identity,
                });

                model.steps.remove(payload.identity);
            },
            {
                concurrent: ActionConcurrent.BLOCK,
            },
        );

        const getStepsById = handler<{ identity: string }, WorkflowStep[]>(
            async ({ model, payload }) => {
                const { call, read } = newHttpRequest("/api/workflow/steps/");

                const callError = await call({
                    timeout: 5000,
                    query: {
                        identity: payload.identity,
                    },
                });

                if (callError) {
                    throw callError;
                }

                const steps: WorkflowStep[] = [];
                const readError = await read((chunk) => {
                    if (chunk.isEntity) {
                        steps.push(chunk.payload);
                    }
                });

                if (readError) {
                    throw readError;
                }

                model.steps.add({
                    key: payload.identity,
                    value: steps,
                });

                return steps;
            },
            {
                concurrent: ActionConcurrent.SKIP,
            },
        );

        const getLogsById = handler<
            {
                identity: string;
                stdout?: boolean;
                stderr?: boolean;
                step?: number;
                count?: number;
            },
            WorkflowLog[]
        >(
            async ({ payload }) => {
                const { call, read } = newHttpRequest("/api/workflow/logs/");

                const callError = await call({
                    timeout: 5000,
                    query: {
                        identity: payload.identity,
                        stdout: payload.stdout,
                        stderr: payload.stderr,
                        step: payload.step,
                        count: payload.count,
                    },
                });

                if (callError) {
                    throw callError;
                }

                const logs: WorkflowLog[] = [];
                const readError = await read((chunk) => {
                    if (chunk.isEntity) {
                        logs.push(chunk.payload);
                    }
                });

                if (readError) {
                    throw readError;
                }

                return logs;
            },
            {
                concurrent: ActionConcurrent.SKIP,
            },
        );

        const applySignal = handler<{ identity: string; signal: WorkflowSignal }>(async ({ model, view, payload }) => {
            const { identity, signal } = payload;

            if (signal.identity && signal.status) {
                model.list.patch({
                    identity: signal.identity,
                    status: signal.status,
                });
            }

            if (signal.step_index !== undefined && signal.step_status) {
                const steps = view.steps.value[identity];
                if (steps) {
                    const stepIndex = steps.findIndex((step) => {
                        return step.index === signal.step_index;
                    });

                    if (stepIndex !== -1) {
                        const updatedSteps = [...steps];
                        updatedSteps[stepIndex] = {
                            ...steps[stepIndex],
                            status: signal.step_status,
                            phase: signal.step_phase ?? steps[stepIndex].phase,
                            exit_code: signal.step_exit_code ?? steps[stepIndex].exit_code,
                        };

                        model.steps.add({
                            key: identity,
                            value: updatedSteps,
                        });
                    }
                }
            }
        });

        const prune = handler<unknown, string[]>(
            async ({ model }) => {
                const { call, read } = newHttpRequest("/api/workflow/prune/");

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

                            model.steps.remove(identity);
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
            model.steps.reset();
        });

        return {
            get,
            create,
            startById,
            stopById,
            removeById,
            getStepsById,
            getLogsById,
            applySignal,
            prune,
            reset,
        };
    },
});
