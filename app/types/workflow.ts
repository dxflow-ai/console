import { shape, type ShapeInfer } from "@diphyx/harlemify/runtime";

export enum WorkflowStatus {
    CREATED = "created",
    STARTED = "started",
    STOPPED = "stopped",
    EXITED = "exited",
}

export enum WorkflowStepPlatform {
    DOCKER = "docker",
    PODMAN = "podman",
    SINGULARITY = "singularity",
    APPTAINER = "apptainer",
}

export enum WorkflowStepMode {
    PARALLEL = "parallel",
    SEQUENTIAL = "sequential",
}

export enum WorkflowStepStatus {
    PENDING = "pending",
    RUNNING = "running",
    EXITED = "exited",
}

export const workflowStepResourcesShape = shape((factory) => {
    return {
        cpu: factory.string(),
        memory: factory.string(),
        gpu: factory.string(),
    };
});

export type WorkflowStepResources = ShapeInfer<typeof workflowStepResourcesShape>;

export const workflowStepDefinitionShape = shape((factory) => {
    return {
        name: factory.string(),
        platform: factory.enum([
            WorkflowStepPlatform.DOCKER,
            WorkflowStepPlatform.PODMAN,
            WorkflowStepPlatform.SINGULARITY,
            WorkflowStepPlatform.APPTAINER,
        ]),
        mode: factory.enum([WorkflowStepMode.PARALLEL, WorkflowStepMode.SEQUENTIAL]),
        image: factory.string(),
        command: factory.array(factory.string()),
        env: factory.array(factory.string()),
        bind: factory.array(factory.string()),
        ports: factory.array(factory.string()),
        resources: workflowStepResourcesShape,
    };
});

export type WorkflowStepDefinition = ShapeInfer<typeof workflowStepDefinitionShape>;

export const workflowStepShape = shape((factory) => {
    return {
        identity: factory.string(),
        index: factory.number(),
        phase: factory.number(),
        name: factory.string(),
        status: factory.enum([WorkflowStepStatus.PENDING, WorkflowStepStatus.RUNNING, WorkflowStepStatus.EXITED]),
        pid: factory.number(),
        started_at: factory.number(),
        exited_at: factory.number(),
        exit_code: factory.number(),
        stderr_path: factory.string(),
        stdout_path: factory.string(),
    };
});

export type WorkflowStep = ShapeInfer<typeof workflowStepShape>;

export const workflowEventShape = shape((factory) => {
    return {
        message: factory.string(),
        time: factory.number(),
    };
});

export type WorkflowEvent = ShapeInfer<typeof workflowEventShape>;

export const workflowSignalShape = shape((factory) => {
    return {
        identity: factory.string().optional(),
        status: factory
            .enum([WorkflowStatus.CREATED, WorkflowStatus.STARTED, WorkflowStatus.STOPPED, WorkflowStatus.EXITED])
            .optional(),
        step_index: factory.number().optional().meta({ alias: "step-index" }),
        step_phase: factory.number().optional().meta({ alias: "step-phase" }),
        step_status: factory
            .enum([WorkflowStepStatus.PENDING, WorkflowStepStatus.RUNNING, WorkflowStepStatus.EXITED])
            .optional()
            .meta({ alias: "step-status" }),
    };
});

export type WorkflowSignal = ShapeInfer<typeof workflowSignalShape>;

export const workflowLogShape = shape((factory) => {
    return {
        prefix: factory.string(),
        output: factory.string(),
    };
});

export type WorkflowLog = ShapeInfer<typeof workflowLogShape>;

export const workflowShape = shape((factory) => {
    return {
        identity: factory.string().meta({ identifier: true }),
        name: factory.string(),
        tags: factory.array(factory.string()),
        status: factory.enum([
            WorkflowStatus.CREATED,
            WorkflowStatus.STARTED,
            WorkflowStatus.STOPPED,
            WorkflowStatus.EXITED,
        ]),
        created_at: factory.number(),
    };
});

export type Workflow = ShapeInfer<typeof workflowShape>;
