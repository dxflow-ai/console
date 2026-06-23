import { ofetch } from "ofetch";
import { sleep } from "radash";

import type { $Fetch, FetchOptions } from "ofetch";

async function tryAwait<T extends any>({
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

export const httpStatus: Record<number, string> = {
    0: "Unknown",
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    500: "Internal Server Error",
    502: "Bad Gateway",
};

export class HttpError extends Error {
    code: number;

    constructor(code: number, message: string) {
        super(message);

        this.code = code;
    }
}

class HttpStatus {
    code: number;
    message: string;

    constructor(value: any) {
        this.code = value?.status || value?.code || 520;
        this.message = value?.statusText || value?.message || "Unknown error";
    }

    get isError() {
        return this.code < 200 || this.code > 299;
    }

    getError() {
        return new HttpError(this.code, this.message);
    }
}

class HttpChunk {
    kind: string;
    payload: any;

    constructor(value: any) {
        this.kind = value?.kind || "unknown";
        this.payload = value?.payload || {};
    }

    get isEmpty() {
        return !this.kind || this.payload === undefined;
    }

    get isStatus() {
        return this.kind == "status";
    }

    get isEntity() {
        return this.kind.startsWith("entity");
    }

    get isTotal() {
        return this.kind == "total";
    }

    get entityTag() {
        if (this.kind.startsWith("entity:")) {
            return this.kind.slice(7);
        }

        return "";
    }

    isEntityWithTag(tag: string) {
        return this.isEntity && this.entityTag === tag;
    }

    getStatus() {
        return new HttpStatus(this.payload);
    }
}

class HttpRequest {
    path: URL;

    fetchClient: $Fetch;

    status!: HttpStatus;
    response!: ReadableStream<Uint8Array>;

    constructor(path: string) {
        if (path[0] === "/") {
            path = path.slice(1);
        }

        this.path = new URL(path, `${window.location.origin}/`);

        this.fetchClient = ofetch.create({
            responseType: "stream",
            headers: {
                Accept: "application/stream+json",
            },
            retry: false,
            onRequestError: ({ error }) => {
                this.status = new HttpStatus(error);

                if (this.status.isError) {
                    throw this.status.getError();
                }
            },
            onResponse: ({ response }) => {
                this.status = new HttpStatus(response);

                if (this.status.isError) {
                    throw this.status.getError();
                }
            },
        });

        this.call = this.call.bind(this);
        this.read = this.read.bind(this);
        this.upload = this.upload.bind(this);
        this.download = this.download.bind(this);
    }

    async call(options?: FetchOptions<"stream", any>, delay: number = 1200): Promise<MaybeError> {
        this.response = await tryAwait({
            delay,
            handler: () => {
                return this.fetchClient(String(this.path), options);
            },
        });

        return null;
    }

    async read(
        callback?: (chunk: HttpChunk) => Promise<void> | void,
        options?: {
            timeout?: number;
        },
    ): Promise<MaybeError> {
        let reader: ReadableStreamDefaultReader<Uint8Array>;
        try {
            reader = this.response.getReader();
        } catch (error: any) {
            return new Error(error?.message || error);
        }

        const decoder = new TextDecoder("utf-8");

        let readAt = 0;
        let readError: Error | null = null;
        let readInterval: ReturnType<typeof setInterval> | undefined;
        if (options?.timeout) {
            readInterval = setInterval(() => {
                if (!readAt) {
                    return;
                }

                const now = Date.now();
                if (now - readAt > options.timeout!) {
                    readError = new Error(`Timeout exceeded`);

                    reader.cancel().catch(() => {
                        // stream already closing
                    });
                }
            }, 1000);
        }

        const processLine = async (line: string): Promise<MaybeError> => {
            if (line.length <= 2) {
                return null;
            }

            let chunks = [] as HttpChunk[];
            try {
                chunks = JSON.parse(`[${line.replace(/^,/, "")}]`);
            } catch (error: any) {
                return new Error(error?.message || error);
            }

            for (const index in chunks) {
                const chunk = new HttpChunk(chunks[index]);
                if (chunk.isEmpty) {
                    continue;
                }

                if (chunk.isStatus) {
                    this.status = chunk.getStatus();

                    if (this.status.isError) {
                        return this.status.getError();
                    }

                    continue;
                }

                if (callback) {
                    await callback(chunk);
                }
            }

            return null;
        };

        let buffer = "";
        try {
            while (true) {
                let done: boolean;
                let value: Uint8Array<ArrayBufferLike> | undefined;
                try {
                    const response = await reader.read();
                    done = response.done;
                    value = response.value;
                } catch (error: any) {
                    return readError || new Error(error?.message || error);
                }

                readAt = Date.now();

                if (readError) {
                    return readError;
                }

                if (done) {
                    break;
                }

                // Buffer across reads so an entity split across two network chunks is
                // only parsed once its terminating newline has arrived.
                buffer += decoder.decode(value, { stream: true });

                const lines = buffer.split(/\n/);
                buffer = lines.pop() ?? "";

                for (const line of lines) {
                    const lineError = await processLine(line);
                    if (lineError) {
                        return lineError;
                    }
                }
            }

            buffer += decoder.decode();

            const flushError = await processLine(buffer);
            if (flushError) {
                return flushError;
            }

            return readError;
        } finally {
            if (readInterval) {
                clearInterval(readInterval);
            }

            reader.cancel().catch(() => {
                // stream already closed/cancelled
            });
        }
    }

    async upload({
        method,
        file,
        header,
        query,
        progress,
    }: {
        method: string;
        file: File;
        header?: Record<string, string>;
        query?: Record<string, any>;
        progress?: (percent: number) => void;
    }): Promise<MaybeError> {
        return new Promise<MaybeError>((resolve) => {
            const xhrClient = new XMLHttpRequest();
            const url = new URL(String(this.path));
            if (query) {
                const searchParams = new URLSearchParams();
                for (const key in query) {
                    const value = query[key];
                    if (!value) {
                        continue;
                    }

                    searchParams.append(key, value);
                }

                url.search = String(searchParams);
            }

            xhrClient.upload.onprogress = ({ loaded }) => {
                if (progress) {
                    progress(Math.floor((loaded / file.size) * 100 * 100) / 100);
                }
            };

            xhrClient.onreadystatechange = () => {
                if (xhrClient.readyState != 4) {
                    return;
                }

                let error: Error | null = null;
                if (xhrClient.status < 200 || xhrClient.status > 299) {
                    try {
                        const response = JSON.parse(xhrClient.responseText);
                        const chunk = new HttpChunk(response[0]);
                        const status = chunk.getStatus();
                        error = status.getError();
                    } catch {
                        let message = xhrClient.getResponseHeader("x-error-message");
                        if (!message) {
                            message = "Failed to upload file";
                        }

                        error = new Error(message);
                    }
                }

                resolve(error);
            };

            try {
                xhrClient.open(method, url);

                if (header) {
                    for (const key in header) {
                        xhrClient.setRequestHeader(key, header[key] as string);
                    }
                }

                xhrClient.send(file);
            } catch (error: any) {
                resolve(new Error(error?.message || error));
            }
        });
    }

    async download({
        method,
        header,
        query,
        progress,
    }: {
        method: string;
        header?: Record<string, string>;
        query?: Record<string, any>;
        progress?: (percent: number) => void;
    }): Promise<[{ blob: Blob; name: string } | null, MaybeError]> {
        return new Promise<[{ blob: Blob; name: string } | null, MaybeError]>((resolve) => {
            const xhrClient = new XMLHttpRequest();
            const url = new URL(String(this.path));
            if (query) {
                const searchParams = new URLSearchParams();
                for (const key in query) {
                    const value = query[key];
                    if (!value) {
                        continue;
                    }

                    searchParams.append(key, value);
                }

                url.search = String(searchParams);
            }

            xhrClient.responseType = "blob";

            xhrClient.onprogress = ({ loaded, total }) => {
                if (progress && total) {
                    progress(Math.floor((loaded / total) * 100 * 100) / 100);
                }
            };

            xhrClient.onreadystatechange = () => {
                if (xhrClient.readyState != 4) {
                    return;
                }

                let error: Error | null = null;
                let result: { blob: Blob; name: string } | null = null;
                if (xhrClient.status < 200 || xhrClient.status > 299) {
                    let message = xhrClient.getResponseHeader("x-error-message");
                    if (!message) {
                        message = "Failed to download file";
                    }

                    error = new Error(message);
                } else {
                    const contentDisposition = xhrClient.getResponseHeader("content-disposition");
                    const filename = contentDisposition?.match(/filename="?(.+?)"?$/)?.[1];
                    if (!filename) {
                        error = new Error("Cannot determine file name");
                    } else {
                        result = {
                            blob: xhrClient.response as Blob,
                            name: filename,
                        };
                    }
                }

                resolve([result, error]);
            };

            try {
                xhrClient.open(method, url);

                if (header) {
                    for (const key in header) {
                        xhrClient.setRequestHeader(key, header[key] as string);
                    }
                }

                xhrClient.send();
            } catch (error: any) {
                resolve([null, new Error(error?.message || error)]);
            }
        });
    }
}

export function newHttpRequest(url: string) {
    const httpRequest = new HttpRequest(url);

    return httpRequest;
}
