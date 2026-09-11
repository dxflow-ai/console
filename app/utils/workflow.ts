import { sum } from "radash";

export function canStartWorkflow(status: MaybeString) {
    return [WorkflowStatus.CREATED, WorkflowStatus.STOPPED, WorkflowStatus.EXITED].includes(status as WorkflowStatus);
}

export function canStopWorkflow(status: MaybeString) {
    return status === WorkflowStatus.STARTED;
}

export function isWorkflowDefinition(file: File) {
    const name = file.name.toLowerCase();

    return name.endsWith(".yaml") || name.endsWith(".yml");
}

export function isWorkflowShell(shell: Shell, identity: string) {
    const prefix = `${identity}-`;

    return shell.args.some((arg) => {
        return arg.startsWith(prefix);
    });
}

const workflowPullStages: Record<string, number> = {
    "pulling fs layer": 0,
    waiting: 0,
    downloading: 0.4,
    "verifying checksum": 0.6,
    "download complete": 0.6,
    extracting: 0.8,
    "pull complete": 1,
    "already exists": 1,
};

const workflowPullPattern = /^(\w+):\s+([a-z ]+)/i;

export function newWorkflowProgress() {
    const layers = new Map<string, number>();

    let percent = 0;

    function weigh(message: string): void {
        const matched = message.trim().match(workflowPullPattern);
        if (!matched) {
            return;
        }

        const [, layer, stage] = matched;

        const weight = workflowPullStages[stage.trim().toLowerCase()];
        if (weight === undefined) {
            return;
        }

        layers.set(layer, Math.max(weight, layers.get(layer) ?? 0));
    }

    function read(message: string): MaybeNumber {
        weigh(message);

        if (!layers.size) {
            return undefined;
        }

        const pulled = sum([...layers.values()]);

        percent = Math.max(percent, Math.min(99, Math.round((pulled / layers.size) * 100)));

        return percent;
    }

    return {
        read,
    };
}
