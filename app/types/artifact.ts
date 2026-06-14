import { shape, type ShapeInfer } from "@diphyx/harlemify/runtime";

export const artifactShareResultShape = shape((factory) => {
    return {
        signature: factory.string(),
        identity: factory.string(),
        expires_at: factory.number(),
    };
});

export type ArtifactShareResult = ShapeInfer<typeof artifactShareResultShape>;

export const artifactZipResultShape = shape((factory) => {
    return {
        destination: factory.string(),
    };
});

export type ArtifactZipResult = ShapeInfer<typeof artifactZipResultShape>;

export const artifactShape = shape((factory) => {
    return {
        identity: factory.string().meta({ identifier: true }),
        name: factory.string(),
        permission: factory.string(),
        size: factory.number(),
        modified_at: factory.number(),
    };
});

export type Artifact = ShapeInfer<typeof artifactShape>;
