import { shape, type ShapeInfer } from "@diphyx/harlemify/runtime";

export const hubWorkflowShape = shape((factory) => {
    return {
        name: factory.string().meta({ identifier: true }),
        url: factory.string(),
        description: factory.string(),
    };
});

export type HubWorkflow = ShapeInfer<typeof hubWorkflowShape>;
