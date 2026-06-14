import { shape, type ShapeInfer } from "@diphyx/harlemify/runtime";

export const engineParameterShape = shape((factory) => {
    return {
        identity: factory.string(),
        directory: factory.string(),
        volume: factory.string(),
        config_profile: factory.string(),
        controllers: factory.array(factory.string()),
    };
});

export type EngineParameter = ShapeInfer<typeof engineParameterShape>;

export const engineHostAttributeShape = shape((factory) => {
    return {
        os: factory.string(),
        platform: factory.string(),
        version: factory.string(),
        arch: factory.string(),
        name: factory.string(),
        boot: factory.number(),
    };
});

export const engineCpuAttributeShape = shape((factory) => {
    return {
        model: factory.string(),
        vendor: factory.string(),
        cores: factory.number(),
    };
});

export const engineMemoryAttributeShape = shape((factory) => {
    return {
        physical: factory.number(),
        swap: factory.number(),
    };
});

export const engineDiskAttributeShape = shape((factory) => {
    return {
        name: factory.string(),
        path: factory.string(),
        size: factory.number(),
    };
});

export const engineNetworkAttributeShape = shape((factory) => {
    return {
        name: factory.string(),
        address: factory.string(),
    };
});

export const engineAttributeShape = shape((factory) => {
    return {
        version: factory.string(),
        host: engineHostAttributeShape,
        cpu: engineCpuAttributeShape,
        memory: engineMemoryAttributeShape,
        disk: factory.array(engineDiskAttributeShape),
        network: factory.array(engineNetworkAttributeShape),
        boot: factory.number(),
    };
});

export type EngineAttribute = ShapeInfer<typeof engineAttributeShape>;

export const engineLicenseShape = shape((factory) => {
    return {
        identity: factory.string(),
        name: factory.string(),
        owner: factory.string(),
        starts: factory.string(),
        expires: factory.string(),
        permission: factory.record(factory.string(), factory.record(factory.string(), factory.any())),
        signature: factory.string(),
        issued: factory.string(),
    };
});

export type EngineLicense = ShapeInfer<typeof engineLicenseShape>;

export const enginePingShape = shape((factory) => {
    return {
        latency: factory.number(),
        timeout: factory.boolean(),
    };
});

export const engineStatShape = shape((factory) => {
    return {
        cpu: factory.array(factory.any()),
        memory: factory.array(factory.any()),
        disk: factory.array(factory.any()),
        network: factory.array(factory.any()),
    };
});

export type EngineStat = {
    cpu: Record<string, { user: number; system: number }>[];
    memory: Record<string, { percent: number; value: number }>[];
    disk: Record<string, { percent: number; value: number }>[];
    network: Record<string, { sent: number; received: number }>[];
};
