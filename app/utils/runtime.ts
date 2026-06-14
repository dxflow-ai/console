import { sleep as wait } from "radash";

export function sleep(delay: number, callback?: () => void) {
    return wait(delay).then(() => {
        if (callback) {
            callback();
        }
    });
}

export async function tryAwait<T extends any>({
    delay,
    handler,
    before,
    after,
}: {
    delay?: number;
    before?: () => Promise<void> | void;
    handler: () => Promise<T> | T;
    after?: () => Promise<void> | void;
}) {
    const startedAt = Date.now();

    if (before) {
        await before();
    }

    await nextTick();
    const output = await handler();

    await nextTick();

    if (delay) {
        const endAt = Date.now();
        const diff = delay - (endAt - startedAt);
        if (diff > 0) {
            await sleep(diff);
        }
    }

    if (after) {
        await after();
    }

    return output;
}

export async function tryTimeout<T extends any>({
    duration,
    handler,
    reject,
}: {
    duration?: number;
    handler: () => Promise<T> | T;
    reject: () => void;
}) {
    const timeout = setTimeout(() => {
        reject();
    }, duration);

    const output = await handler();

    clearTimeout(timeout);

    return output;
}
