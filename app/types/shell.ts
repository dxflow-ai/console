import { shape, type ShapeInfer } from "@diphyx/harlemify/runtime";

export enum ShellState {
    CREATED = "created",
    EXECUTED = "executed",
    FAILED = "failed",
    KILLED = "killed",
    EXITED = "exited",
}

export const shellShape = shape((factory) => {
    return {
        identity: factory.string().meta({ identifier: true }),
        path: factory.string(),
        args: factory.array(factory.string()),
        state: factory.enum([
            ShellState.CREATED,
            ShellState.EXECUTED,
            ShellState.FAILED,
            ShellState.KILLED,
            ShellState.EXITED,
        ]),
        columns: factory.number(),
        rows: factory.number(),
        sessions: factory.number(),
        created_at: factory.number(),
    };
});

export type Shell = ShapeInfer<typeof shellShape>;
