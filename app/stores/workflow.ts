import { ModelManyKind, ViewClone, ActionConcurrent } from "@diphyx/harlemify/runtime";
import { all, isArray } from "radash";

let workflowLogsLiveAbortController: AbortController | null = null;
let workflowSignalsAbortController: AbortController | null = null;

function stopWorkflowLogsLive() {
    if (workflowLogsLiveAbortController) {
        workflowLogsLiveAbortController.abort();
        workflowLogsLiveAbortController = null;
    }
}

function stopWorkflowSignals() {
    if (workflowSignalsAbortController) {
        workflowSignalsAbortController.abort();
        workflowSignalsAbortController = null;
    }
}

export const workflowStore = createStore({
    name: "workflow",
    model({ many }) {
        const list = many(workflowShape);
        const steps = many(workflowStepShape, { kind: ModelManyKind.RECORD });
        const events = many(workflowEventShape, { kind: ModelManyKind.RECORD });
        return {
            list,
            steps,
            events,
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

        const workflowSteps = from("steps");
        const workflowEvents = from("events");
        return {
            ordered,
            workflowSteps,
            workflowEvents,
        };
    },
    action({ handler }) {
        const load = handler<unknown, Workflow[]>(
            async ({ model }) => {
                const request = newHttpRequest("/api/workflow/");
                const callError = await request.call();
                ensure(callError);

                const workflows: Workflow[] = [];
                const readError = await request.read((chunk) => {
                    if (chunk.isEntity) {
                        workflows.push(chunk.payload);
                        model.list.add(chunk.payload, { unique: true });
                    }
                });
                ensure(readError);

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
                const request = newHttpRequest("/api/workflow/");
                const callError = await request.call({
                    method: "POST",
                    query: {
                        identity: payload.identity,
                    },
                    body: payload.source,
                });
                ensure(callError);

                let workflow: Workflow | null = null;
                const readError = await request.read((chunk) => {
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
                    model.list.add(chunk.payload, { prepend: true });
                });
                ensure(readError);

                return workflow;
            },
            {
                concurrent: ActionConcurrent.BLOCK,
            },
        );

        const start = handler<
            {
                identity: string;
                onMessage?: (message: string) => void;
                onError?: (error: string) => void;
            },
            Workflow | null
        >(
            async ({ model, payload }) => {
                const request = newHttpRequest("/api/workflow/start/");
                const callError = await request.call({
                    method: "PUT",
                    body: {
                        identity: payload.identity,
                    },
                });
                ensure(callError);

                let workflow: Workflow | null = null;
                const readError = await request.read((chunk) => {
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
                ensure(readError);

                return workflow;
            },
            {
                concurrent: ActionConcurrent.BLOCK,
            },
        );

        const stop = handler<
            {
                identity: string;
                onMessage?: (message: string) => void;
                onError?: (error: string) => void;
            },
            Workflow | null
        >(
            async ({ model, payload }) => {
                const request = newHttpRequest("/api/workflow/stop/");
                const callError = await request.call({
                    method: "PUT",
                    body: {
                        identity: payload.identity,
                    },
                });
                ensure(callError);

                let workflow: Workflow | null = null;
                const readError = await request.read((chunk) => {
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
                ensure(readError);

                return workflow;
            },
            {
                concurrent: ActionConcurrent.BLOCK,
            },
        );

        const remove = handler<{ identity: string }>(
            async ({ model, payload }) => {
                const request = newHttpRequest("/api/workflow/");
                const callError = await request.call({
                    method: "DELETE",
                    query: payload,
                });
                ensure(callError);

                const readError = await request.read(() => {});
                ensure(readError);

                model.list.remove({ identity: payload.identity });
                model.steps.remove(payload.identity);
                model.events.remove(payload.identity);
            },
            {
                concurrent: ActionConcurrent.BLOCK,
            },
        );

        const removeBatch = handler<{ identities: string[] }, Array<{ identity: string; error?: string }>>(
            async ({ model, payload }) => {
                const request = newHttpRequest("/api/workflow/batch/");
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
                            model.steps.remove(chunk.payload.identity);
                            model.events.remove(chunk.payload.identity);
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
                const request = newHttpRequest("/api/workflow/prune/");
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
                                model.steps.remove(identity);
                                model.events.remove(identity);
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

        const loadSteps = handler<{ identity: string }, WorkflowStep[]>(
            async ({ model, payload }) => {
                const request = newHttpRequest("/api/workflow/steps/");
                const callError = await request.call({
                    timeout: 5000,
                    query: {
                        identity: payload.identity,
                    },
                });
                ensure(callError);

                const steps: WorkflowStep[] = [];
                const readError = await request.read((chunk) => {
                    if (chunk.isEntity) {
                        steps.push(chunk.payload);
                    }
                });
                ensure(readError);

                model.steps.add({ key: payload.identity, value: steps });

                return steps;
            },
            {
                concurrent: ActionConcurrent.SKIP,
            },
        );

        const loadEvents = handler<{ identity: string }, WorkflowEvent[]>(
            async ({ model, payload }) => {
                const request = newHttpRequest("/api/workflow/events/");
                const callError = await request.call({
                    timeout: 5000,
                    query: {
                        identity: payload.identity,
                    },
                });
                ensure(callError);

                const events: WorkflowEvent[] = [];
                const readError = await request.read((chunk) => {
                    if (chunk.isEntity) {
                        events.push(chunk.payload);
                    }
                });
                ensure(readError);

                model.events.add({ key: payload.identity, value: events });

                return events;
            },
            {
                concurrent: ActionConcurrent.SKIP,
            },
        );

        const loadLogs = handler<
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
                const request = newHttpRequest("/api/workflow/logs/");
                const callError = await request.call({
                    timeout: 5000,
                    query: {
                        identity: payload.identity,
                        stdout: payload.stdout,
                        stderr: payload.stderr,
                        step: payload.step,
                        count: payload.count,
                    },
                });
                ensure(callError);

                const logs: WorkflowLog[] = [];
                const readError = await request.read((chunk) => {
                    if (chunk.isEntity) {
                        logs.push(chunk.payload);
                    }
                });
                ensure(readError);

                return logs;
            },
            {
                concurrent: ActionConcurrent.SKIP,
            },
        );

        const startLogsLive = handler<{
            identity: string;
            stdout?: boolean;
            stderr?: boolean;
            onLog?: (log: WorkflowLog) => void;
        }>(
            async ({ payload }) => {
                stopWorkflowLogsLive();

                workflowLogsLiveAbortController = new AbortController();

                const request = newHttpRequest("/api/workflow/logs/live/");
                const callError = await request.call({
                    timeout: 0,
                    signal: workflowLogsLiveAbortController.signal,
                    query: {
                        identity: payload.identity,
                        stdout: payload.stdout,
                        stderr: payload.stderr,
                    },
                });
                ensure(callError);

                const readError = await request.read((chunk) => {
                    if (chunk.isEntity) {
                        payload.onLog?.(chunk.payload);
                    }
                });
                ensure(readError);
            },
            {
                concurrent: ActionConcurrent.CANCEL,
            },
        );

        const startSignals = handler<{
            identity: string;
            onSignal?: (signal: WorkflowSignal) => void;
        }>(
            async ({ model, view, payload }) => {
                stopWorkflowSignals();

                workflowSignalsAbortController = new AbortController();

                const request = newHttpRequest("/api/workflow/signals/");
                const callError = await request.call({
                    timeout: 0,
                    signal: workflowSignalsAbortController.signal,
                    query: {
                        identity: payload.identity,
                    },
                });
                ensure(callError);

                const readError = await request.read((chunk) => {
                    if (!chunk.isEntity) {
                        return;
                    }

                    const signal: WorkflowSignal = chunk.payload;
                    if (signal.identity && signal.status) {
                        model.list.patch({
                            identity: signal.identity,
                            status: signal.status,
                        });
                    }

                    if (signal.step_index !== undefined && signal.step_status) {
                        const steps = view.workflowSteps.value[payload.identity];
                        if (steps) {
                            const stepIndex = steps.findIndex((s) => {
                                return s.index === signal.step_index;
                            });
                            if (stepIndex !== -1) {
                                const updatedSteps = [...steps];
                                updatedSteps[stepIndex] = {
                                    ...steps[stepIndex],
                                    status: signal.step_status,
                                    phase: signal.step_phase ?? steps[stepIndex].phase,
                                };

                                model.steps.add({ key: payload.identity, value: updatedSteps });
                            }
                        }
                    }

                    payload.onSignal?.(signal);
                });
                ensure(readError);
            },
            {
                concurrent: ActionConcurrent.CANCEL,
            },
        );

        const reset = handler(async ({ model }) => {
            model.list.reset();
            model.steps.reset();
            model.events.reset();
            stopWorkflowLogsLive();
            stopWorkflowSignals();
        });
        return {
            load,
            create,
            start,
            stop,
            remove,
            removeBatch,
            prune,
            loadSteps,
            loadEvents,
            loadLogs,
            startLogsLive,
            startSignals,
            reset,
        };
    },
    compose({ action }) {
        async function loadDetail(identity: string) {
            await all([action.loadSteps({ payload: { identity } }), action.loadEvents({ payload: { identity } })]);
        }

        async function loadAndWatch(identity: string) {
            await loadDetail(identity);
            await action.startSignals({ payload: { identity } });
        }

        return {
            loadDetail,
            loadAndWatch,
        };
    },
});
