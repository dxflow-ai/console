import { shape, type ShapeInfer } from "@diphyx/harlemify/runtime";

export const sessionShape = shape((factory) => {
    return {
        token: factory.string(),
        sub: factory.string(),
        exp: factory.number(),
        identity: factory.string(),
        writable: factory.boolean(),
        permissions: factory.array(factory.string()),
    };
});

export type Session = ShapeInfer<typeof sessionShape>;
