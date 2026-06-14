import { shape, type ShapeInfer } from "@diphyx/harlemify/runtime";

export const accountShape = shape((factory) => {
    return {
        identity: factory.string().meta({ identifier: true }),
        email: factory.email(),
        name: factory.string(),
        authenticator: factory.string(),
        disabled: factory.boolean(),
        created_at: factory.number(),
    };
});

export type Account = ShapeInfer<typeof accountShape>;
