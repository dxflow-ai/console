export function canStartWorkflow(status: MaybeString) {
    return [WorkflowStatus.CREATED, WorkflowStatus.STOPPED, WorkflowStatus.EXITED].includes(status as WorkflowStatus);
}

export function canStopWorkflow(status: MaybeString) {
    return status === WorkflowStatus.STARTED;
}
