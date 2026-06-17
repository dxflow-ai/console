export type LiveStream = {
    start: () => void;
    stop: () => void;
};

export function newLiveStream(
    url: string,
    options: {
        query?: Record<string, any>;
        onEntity: (payload: any) => void;
        onError?: (error: Error) => void;
        callTimeout?: number;
        readTimeout?: number;
        retryDelay?: number;
        retryStep?: number;
    },
): LiveStream {
    const callTimeout = options.callTimeout ?? 2500;
    const retryDelay = options.retryDelay ?? 2500;
    const retryStep = options.retryStep ?? 2500;

    let running = false;
    let controller: AbortController | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    function retry(error: Error, delay: number) {
        if (options.onError) {
            options.onError(error);
        }

        if (running) {
            retryTimer = setTimeout(() => {
                return loop(delay + retryStep);
            }, delay);
        }
    }

    async function loop(delay = retryDelay) {
        if (!running) {
            return;
        }

        controller = new AbortController();

        const { call, read } = newHttpRequest(url);

        const callError = await call({
            signal: controller.signal,
            timeout: callTimeout,
            query: options.query,
        });

        if (callError) {
            return retry(callError, delay);
        }

        const readError = await read(
            (chunk) => {
                if (chunk.isEntity) {
                    options.onEntity(chunk.payload);
                }
            },
            { timeout: options.readTimeout },
        );

        if (readError) {
            return retry(readError, delay);
        }

        if (running) {
            loop();
        }
    }

    function start() {
        if (running) {
            return;
        }

        running = true;
        loop();
    }

    function stop() {
        running = false;
        controller?.abort();
        controller = null;

        if (retryTimer) {
            clearTimeout(retryTimer);
            retryTimer = null;
        }
    }

    return {
        start,
        stop,
    };
}
