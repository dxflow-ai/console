type WebSocketWrapperCallback = {
    onOpen?: () => void;
    onData?: (value: string) => void;
    onClose?: () => void;
};

export function newWebSocketWrapper() {
    class WebSocketWrapper {
        timeout!: ReturnType<typeof setTimeout>;
        client!: WebSocket;

        get url() {
            return window.location.origin.replace(/^http/, "ws");
        }

        connect({ path, onOpen, onData, onClose }: { path: string } & WebSocketWrapperCallback) {
            return new Promise<MaybeError>((resolve) => {
                this.client = new WebSocket(`${this.url}${path}`);

                this.timeout = setTimeout(() => {
                    this.client.close();
                }, 2500);

                this.client.addEventListener(
                    "open",
                    () => {
                        clearTimeout(this.timeout);

                        this.timeout = setTimeout(() => {
                            resolve(null);

                            if (onOpen) {
                                onOpen();
                            }
                        }, 250);
                    },
                    {
                        once: true,
                    },
                );

                this.client.addEventListener("message", ({ data }) => {
                    if (onData) {
                        onData(data);
                    }
                });

                this.client.addEventListener(
                    "close",
                    (error) => {
                        clearTimeout(this.timeout);

                        this.timeout = setTimeout(() => {
                            resolve(new Error(`WebSocket closed with code ${error?.code || 0}`));

                            if (onClose) {
                                onClose();
                            }
                        }, 250);
                    },
                    {
                        once: true,
                    },
                );
            });
        }

        tryWrite(data: string): MaybeError {
            try {
                if (this.client?.readyState !== WebSocket.OPEN) {
                    return new Error("WebSocket is not open");
                }

                this.client.send(data);

                return null;
            } catch (error: any) {
                return new Error(error?.message || error);
            }
        }

        close() {
            clearTimeout(this.timeout);

            try {
                this.client?.close();
            } catch {
                // already closing/closed
            }
        }
    }

    const webSocketWrapper = new WebSocketWrapper();
    return webSocketWrapper;
}
