type WorkflowSignalHandler = (signal: WorkflowSignal) => void;
type WorkflowOperation = "start" | "stop" | "remove";

const workflowSignalWatchers = new Map<string, { stream: LiveStream; handlers: Set<WorkflowSignalHandler> }>();
const busyOperations = ref<Map<string, WorkflowOperation>>(new Map());

function normalizeWorkflowSignal(payload: any): WorkflowSignal {
    return {
        identity: payload.identity,
        status: payload.status,
        step_index: payload["step-index"],
        step_phase: payload["step-phase"],
        step_status: payload["step-status"],
        step_exit_code: payload["step-exit-code"],
    };
}

function watchWorkflowSignals(identity: string, handler: WorkflowSignalHandler) {
    let watcher = workflowSignalWatchers.get(identity);
    if (!watcher) {
        const handlers = new Set<WorkflowSignalHandler>();

        const stream = newLiveStream("/api/workflow/signals/", {
            query: {
                identity,
            },
            onEntity(payload) {
                const signal = normalizeWorkflowSignal(payload);

                for (const item of handlers) {
                    item(signal);
                }
            },
        });

        watcher = {
            stream,
            handlers,
        };

        workflowSignalWatchers.set(identity, watcher);
        stream.start();
    }

    watcher.handlers.add(handler);

    return () => {
        const current = workflowSignalWatchers.get(identity);
        if (!current) {
            return;
        }

        current.handlers.delete(handler);

        if (!current.handlers.size) {
            current.stream.stop();
            workflowSignalWatchers.delete(identity);
        }
    };
}

export function useWorkflowFileDialog() {
    const dialog = useFileDialog({
        reset: true,
        multiple: false,
        accept: ".yaml,.yml,application/x-yaml,text/yaml",
    });

    return dialog;
}

export function useWorkflowLogs() {
    const lines = ref<WorkflowLog[]>([]);
    const activeIdentity = ref<MaybeString>();
    const loading = ref(false);

    const { execute: fetchLogs } = useStoreAction(workflowStore, "getLogsById", {
        isolated: true,
    });

    let stream: LiveStream | null = null;

    function stop() {
        stream?.stop();
        stream = null;
        activeIdentity.value = null;
    }

    async function start(identity: string) {
        stop();

        activeIdentity.value = identity;
        lines.value = [];
        loading.value = true;

        try {
            const previous = await fetchLogs({
                payload: {
                    identity,
                    count: 200,
                },
            });

            if (activeIdentity.value !== identity) {
                return;
            }

            lines.value = previous ?? [];
        } catch (error) {
            dangerToast("Failed to load logs", error as Error);
        } finally {
            loading.value = false;
        }

        stream = newLiveStream("/api/workflow/logs/live/", {
            query: {
                identity,
                stdout: true,
                stderr: true,
            },
            onEntity(payload) {
                lines.value.push(payload);
            },
        });

        stream.start();
    }

    function clear() {
        lines.value = [];
    }

    return {
        lines,
        activeIdentity,
        loading,
        start,
        stop,
        clear,
    };
}

export function useWorkflowDefinition(identity: string) {
    const definitions = ref<Record<string, WorkflowStepDefinition>>({});

    const { execute } = useStoreAction(artifactStore, "downloadById", {
        isolated: true,
    });

    async function load() {
        try {
            const result = await execute({
                payload: {
                    identity: `${identity}/workflow.json`,
                },
            });

            if (!result) {
                return;
            }

            const source = await result.blob.text();
            const parsed = JSON.parse(source) as {
                steps?: Array<{ identity: string; definition?: WorkflowStepDefinition }>;
            };

            const map: Record<string, WorkflowStepDefinition> = {};
            for (const step of parsed.steps ?? []) {
                if (step.identity && step.definition) {
                    map[step.identity] = step.definition;
                }
            }

            definitions.value = map;
        } catch {}
    }

    onMounted(load);

    return {
        definitions,
    };
}

export function useWorkflowSteps(identity: string) {
    const { data } = useStoreView(workflowStore, "steps", (record) => {
        return record[identity] ?? [];
    });

    const { execute, loading } = useStoreAction(workflowStore, "getStepsById", {
        isolated: true,
    });

    const { execute: applySignal } = useStoreAction(workflowStore, "applySignal", {
        isolated: true,
    });

    let unwatch: (() => void) | null = null;

    async function load() {
        try {
            await execute({
                payload: {
                    identity,
                },
            });
        } catch (error) {
            dangerToast("Failed to load workflow", error as Error);
        }
    }

    async function reconcile() {
        try {
            await workflowStore.action.getStepsById({
                payload: {
                    identity,
                },
            });
        } catch {
            // keep last known step states
        }
    }

    onMounted(async () => {
        await load();

        unwatch = watchWorkflowSignals(identity, (signal) => {
            applySignal({
                payload: {
                    identity,
                    signal,
                },
            });

            if (signal.status === WorkflowStatus.STOPPED || signal.status === WorkflowStatus.EXITED) {
                reconcile();
            }
        });
    });

    onUnmounted(() => {
        unwatch?.();
    });

    return {
        data,
        loading,
    };
}

export function useWorkflowActions() {
    const { closeTabsWhere, openWorkflow } = useTabs();

    const { data: artifacts } = useStoreView(artifactStore, "list");

    const { execute: executeCreate, loading: creating } = useStoreAction(workflowStore, "create", {
        isolated: true,
    });

    const { execute: executeStart } = useStoreAction(workflowStore, "startById", {
        isolated: true,
    });

    const { execute: executeStop } = useStoreAction(workflowStore, "stopById", {
        isolated: true,
    });

    const { execute: executeRemove } = useStoreAction(workflowStore, "removeById", {
        isolated: true,
    });

    const { execute: executePrune, loading: pruning } = useStoreAction(workflowStore, "prune");

    const confirmPrune = useConfirmToast({
        id: "workflow-prune",
        color: "neutral",
        title() {
            return "Prune workflows";
        },
        description() {
            return "Remove all finished workflows?";
        },
    });

    const confirmRemove = useConfirmToast<Workflow>({
        id: "workflow-remove",
        color: "neutral",
        title() {
            return "Remove workflow";
        },
        description(workflow) {
            return `Remove "${workflow.name}" and stop its containers?`;
        },
    });

    function isBusy(identity: string) {
        return busyOperations.value.has(identity);
    }

    function isBusyWith(identity: string, operation: WorkflowOperation) {
        return busyOperations.value.get(identity) === operation;
    }

    async function withBusy<T>(identity: string, operation: WorkflowOperation, run: () => Promise<T>) {
        busyOperations.value.set(identity, operation);

        try {
            return await run();
        } finally {
            busyOperations.value.delete(identity);
        }
    }

    function closeTabs(identity: string) {
        closeTabsWhere((tab) => {
            return tab.key.startsWith(`workflow:${identity}:`);
        });
    }

    function cleanupArtifacts(identity: string) {
        artifactStore.action.cleanup({
            payload: {
                match(artifact) {
                    return artifact.identity.endsWith(`/${identity}`) || artifact.identity.includes(`/${identity}/`);
                },
            },
        });
    }

    function refreshArtifacts() {
        if (!artifacts.value.length) {
            return;
        }

        artifactStore.action.list({
            payload: {
                directory: ".",
            },
        });
    }

    async function create(file: File) {
        try {
            const source = await file.text();

            const workflow = await executeCreate({
                payload: {
                    source,
                    onError(message) {
                        throw new Error(message);
                    },
                },
            });

            if (workflow) {
                openWorkflow({
                    workflow,
                });

                refreshArtifacts();
            }
        } catch (error) {
            dangerToast("Failed to create workflow", error as Error);
        }
    }

    async function operate(workflow: Workflow, operation: "start" | "stop", execute: typeof executeStart) {
        try {
            await withBusy(workflow.identity, operation, () => {
                return execute({
                    payload: {
                        identity: workflow.identity,
                        onError(message) {
                            throw new Error(message);
                        },
                    },
                });
            });
        } catch (error) {
            dangerToast(`Failed to ${operation} workflow`, error as Error);
        }
    }

    function start(workflow: Workflow) {
        return operate(workflow, "start", executeStart);
    }

    function stop(workflow: Workflow) {
        return operate(workflow, "stop", executeStop);
    }

    async function remove(workflow: Workflow) {
        const confirmed = await confirmRemove.open(workflow);
        if (!confirmed) {
            return;
        }

        try {
            await withBusy(workflow.identity, "remove", () => {
                return executeRemove({
                    payload: {
                        identity: workflow.identity,
                    },
                });
            });

            closeTabs(workflow.identity);
            cleanupArtifacts(workflow.identity);
        } catch (error) {
            dangerToast("Failed to remove workflow", error as Error);
        }
    }

    async function prune() {
        const confirmed = await confirmPrune.open();
        if (!confirmed) {
            return;
        }

        try {
            const removed = await executePrune();

            removed?.forEach((identity) => {
                closeTabs(identity);
                cleanupArtifacts(identity);
            });
        } catch (error) {
            dangerToast("Failed to prune workflows", error as Error);
        }
    }

    return {
        creating,
        pruning,
        isBusy,
        isBusyWith,
        create,
        start,
        stop,
        remove,
        prune,
    };
}
