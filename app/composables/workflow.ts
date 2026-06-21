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

    let stream: LiveStream | null = null;

    function stop() {
        stream?.stop();
        stream = null;
        activeIdentity.value = null;
    }

    function start(identity: string) {
        stop();

        activeIdentity.value = identity;
        lines.value = [];

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

    return {
        lines,
        activeIdentity,
        start,
        stop,
    };
}

export function useWorkflowSteps(identity: string) {
    const { data } = useStoreView(workflowStore, "steps", (record) => {
        return record[identity] ?? [];
    });

    const { execute, loading } = useStoreAction(workflowStore, "getStepsById", {
        isolated: true,
    });

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

    onMounted(() => {
        load();
    });

    return {
        data,
        loading,
    };
}

export function useWorkflowEvents(identity: string) {
    const { data } = useStoreView(workflowStore, "events", (record) => {
        return record[identity] ?? [];
    });

    const { execute, loading } = useStoreAction(workflowStore, "getEventsById", {
        isolated: true,
    });

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

    onMounted(() => {
        load();
    });

    return {
        data,
        loading,
    };
}

export function useWorkflowActions() {
    const { closeTabsWhere } = useTabs();

    const { execute: executeCreate, loading: creating } = useStoreAction(workflowStore, "create", {
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

    function closeTabs(identity: string) {
        closeTabsWhere((tab) => {
            return tab.key.startsWith(`workflow:${identity}:`);
        });
    }

    async function create(file: File) {
        try {
            const source = await file.text();

            await executeCreate({
                payload: {
                    source,
                },
            });
        } catch (error) {
            dangerToast("Failed to create workflow", error as Error);
        }
    }

    async function prune() {
        const confirmed = await confirmPrune.open();
        if (!confirmed) {
            return;
        }

        try {
            const removed = await executePrune();

            removed?.forEach(closeTabs);
        } catch (error) {
            dangerToast("Failed to prune workflows", error as Error);
        }
    }

    return {
        creating,
        pruning,
        create,
        prune,
    };
}
