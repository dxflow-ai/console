export function useWorkflow() {
    function logs() {
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

    return {
        logs,
    };
}

export function useWorkflowActions() {
    const { execute: executeCreate, loading: creating } = useStoreAction(workflowStore, "create", {
        isolated: true,
    });

    async function createFromFile(file: File) {
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

    return {
        creating,
        createFromFile,
    };
}
