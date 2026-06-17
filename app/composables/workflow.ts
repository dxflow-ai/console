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
