import { all, defer, tryit } from "radash";
import { ActionConcurrent } from "@diphyx/harlemify/runtime";

const STAT_LIMITS: Record<keyof EngineStat, number> = {
    cpu: 30,
    memory: 30,
    disk: 2,
    network: 2,
};

let liveStatState = false;
let liveStatController: AbortController | null = null;
let liveStatRetryTimer: ReturnType<typeof setTimeout> | null = null;

let livePingState = false;
let livePingController: AbortController | null = null;
let livePingRetryTimer: ReturnType<typeof setTimeout> | null = null;
let pingTimeoutTimer: ReturnType<typeof setTimeout> | null = null;

export const engineStore = createStore({
    name: "engine",
    model({ one }) {
        const parameter = one(engineParameterShape);
        const attribute = one(engineAttributeShape);
        const license = one(engineLicenseShape);
        const stat = one(engineStatShape);
        const ping = one(enginePingShape);

        return {
            parameter,
            attribute,
            license,
            stat,
            ping,
        };
    },
    view({ from }) {
        const parameter = from("parameter");
        const attribute = from("attribute");
        const license = from("license");
        const stat = from("stat");
        const ping = from("ping");

        return {
            parameter,
            attribute,
            license,
            stat,
            ping,
        };
    },
    action({ handler }) {
        const getParameter = handler<unknown, EngineParameter | null>(
            async ({ model }) => {
                const { call, read } = newHttpRequest("/api/engine/parameter/");

                const callError = await call({
                    timeout: 2500,
                });

                if (callError) {
                    throw callError;
                }

                let result: EngineParameter | null = null;
                const readError = await read((chunk) => {
                    if (chunk.isEntity) {
                        result = chunk.payload;
                        model.parameter.set(chunk.payload);
                    }
                });

                if (readError) {
                    throw readError;
                }

                return result;
            },
            {
                concurrent: ActionConcurrent.SKIP,
            },
        );

        const getAttribute = handler<unknown, EngineAttribute | null>(
            async ({ model }) => {
                const { call, read } = newHttpRequest("/api/engine/attribute/");

                const callError = await call({
                    timeout: 2500,
                });

                if (callError) {
                    throw callError;
                }

                let result: EngineAttribute | null = null;
                const readError = await read((chunk) => {
                    if (chunk.isEntity) {
                        result = chunk.payload;
                        model.attribute.set(chunk.payload);
                    }
                });

                if (readError) {
                    throw readError;
                }

                return result;
            },
            {
                concurrent: ActionConcurrent.SKIP,
            },
        );

        const getLicense = handler<unknown, EngineLicense | null>(
            async ({ model }) => {
                const { call, read } = newHttpRequest("/api/engine/license/");

                const callError = await call({
                    timeout: 2500,
                });

                if (callError) {
                    throw callError;
                }

                let result: EngineLicense | null = null;
                const readError = await read((chunk) => {
                    if (chunk.isEntity) {
                        result = chunk.payload;
                        model.license.set(chunk.payload);
                    }
                });

                if (readError) {
                    throw readError;
                }

                return result;
            },
            {
                concurrent: ActionConcurrent.SKIP,
            },
        );

        const getStat = handler<{ target: keyof EngineStat }>(
            async ({ model, view, payload }) => {
                const { call, read } = newHttpRequest(`/api/engine/stat/last/${payload.target}/`);

                const callError = await call({
                    timeout: 2500,
                });

                if (callError) {
                    throw callError;
                }

                const readError = await read((chunk) => {
                    if (!chunk.isEntity) {
                        return;
                    }

                    const statPoints = chunk.payload?.points;
                    if (!statPoints) {
                        return;
                    }

                    const currentStat = {
                        ...engineStatShape.defaults(),
                        ...view.stat.value,
                    };

                    const limit = STAT_LIMITS[payload.target];
                    const arr = [...(currentStat[payload.target] || [])];
                    arr.push(statPoints);

                    if (arr.length > limit) {
                        arr.splice(0, arr.length - limit);
                    }

                    model.stat.patch({
                        [payload.target]: arr,
                    });
                });

                if (readError) {
                    throw readError;
                }
            },
            {
                concurrent: ActionConcurrent.ALLOW,
            },
        );

        return {
            getParameter,
            getAttribute,
            getLicense,
            getStat,
        };
    },
    compose({ model, view, action }) {
        async function loadAll() {
            await all({
                parameter: action.getParameter(),
                attribute: action.getAttribute(),
                license: action.getLicense(),
            });
        }

        function startPing(onUnauthorized?: () => void) {
            if (livePingState) {
                return;
            }

            async function loop(delay = 2500) {
                if (!livePingState) {
                    return;
                }

                livePingController = new AbortController();

                const { call, read } = newHttpRequest("/api/engine/ping/");

                const [callError] = await defer(async (cleanup) => {
                    const timeout = setTimeout(() => {
                        livePingController?.abort();
                    }, 2500);

                    cleanup(() => {
                        clearTimeout(timeout);
                    });

                    return tryit(call)({
                        signal: livePingController!.signal,
                        query: {
                            count: 60,
                            interval: 5000,
                        },
                    });
                });

                if (callError) {
                    if (callError instanceof HttpError && callError.code === 401) {
                        onUnauthorized?.();
                    }

                    clearTimeout(pingTimeoutTimer);

                    pingTimeoutTimer = setTimeout(() => {
                        model.ping.patch({
                            timeout: true,
                        });
                    }, 250);

                    if (livePingState) {
                        livePingRetryTimer = setTimeout(() => {
                            return loop(delay + 2500);
                        }, delay);
                    }

                    return;
                }

                const readError = await read(
                    (chunk) => {
                        if (chunk.isEntity) {
                            const now = Date.now();
                            if (now > chunk.payload) {
                                model.ping.set({
                                    timeout: false,
                                    latency: now - chunk.payload,
                                });
                            }
                        }
                    },
                    {
                        timeout: 7500,
                    },
                );

                if (readError) {
                    clearTimeout(pingTimeoutTimer);

                    pingTimeoutTimer = setTimeout(() => {
                        model.ping.patch({
                            timeout: true,
                        });
                    }, 250);

                    if (livePingState) {
                        livePingRetryTimer = setTimeout(() => {
                            return loop(delay + 2500);
                        }, delay);
                    }

                    return;
                }

                if (livePingState) {
                    loop();
                }
            }

            livePingState = true;

            loop();
        }

        function startStat() {
            if (liveStatState) {
                return;
            }

            async function loop(delay = 2500) {
                if (!liveStatState) {
                    return;
                }

                liveStatController = new AbortController();

                const { call, read } = newHttpRequest("/api/engine/stat/live/");

                const [callError] = await defer(async (cleanup) => {
                    const timeout = setTimeout(() => {
                        liveStatController?.abort();
                    }, 2500);

                    cleanup(() => {
                        clearTimeout(timeout);
                    });

                    return tryit(call)({
                        signal: liveStatController!.signal,
                        query: {
                            duration: 300,
                        },
                    });
                });

                if (callError) {
                    if (liveStatState) {
                        liveStatRetryTimer = setTimeout(() => {
                            return loop(delay + 2500);
                        }, delay);
                    }

                    return;
                }

                const readError = await read((chunk) => {
                    if (!chunk.isEntity) {
                        return;
                    }

                    const statType = chunk.payload?.type?.toLowerCase() as keyof EngineStat | undefined;
                    const statPoints = chunk.payload?.points;
                    if (!statType || !statPoints) {
                        return;
                    }

                    const limit = STAT_LIMITS[statType];
                    if (!limit) {
                        return;
                    }

                    const currentStat = { ...engineStatShape.defaults(), ...view.stat.value };
                    const arr = [...(currentStat[statType] || [])];
                    arr.push(statPoints);

                    if (arr.length > limit) {
                        arr.splice(0, arr.length - limit);
                    }

                    model.stat.patch({
                        [statType]: arr,
                    });
                });

                if (readError) {
                    if (liveStatState) {
                        liveStatRetryTimer = setTimeout(() => {
                            return loop(delay + 2500);
                        }, delay);
                    }

                    return;
                }

                if (liveStatState) {
                    loop();
                }
            }

            liveStatState = true;

            loop();
        }

        function stopPing() {
            livePingState = false;
            livePingController?.abort();
            livePingController = null;

            if (livePingRetryTimer) {
                clearTimeout(livePingRetryTimer);
                livePingRetryTimer = null;
            }

            if (pingTimeoutTimer) {
                clearTimeout(pingTimeoutTimer);
                pingTimeoutTimer = null;
            }
        }

        function stopStat() {
            liveStatState = false;
            liveStatController?.abort();
            liveStatController = null;

            if (liveStatRetryTimer) {
                clearTimeout(liveStatRetryTimer);
                liveStatRetryTimer = null;
            }
        }

        async function startLive(onUnauthorized?: () => void) {
            startPing(onUnauthorized);
            startStat();
        }

        async function stopLive() {
            stopPing();
            stopStat();
        }

        async function reset() {
            stopStat();
            stopPing();

            model.parameter.reset();
            model.attribute.reset();
            model.license.reset();
            model.stat.reset();
            model.ping.reset();
        }

        return {
            loadAll,
            startLive,
            stopLive,
            reset,
        };
    },
});
