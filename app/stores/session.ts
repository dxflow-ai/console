import { ModelOneMode, ActionConcurrent } from "@diphyx/harlemify/runtime";

export const sessionStore = createStore({
    name: "session",
    model({ one }) {
        const session = one(sessionShape, {
            default() {
                return useTokenCookie().get();
            },
            post({ mode, state }) {
                const tokenCookie = useTokenCookie();

                switch (mode) {
                    case ModelOneMode.SET: {
                        tokenCookie.set(state.token);
                        break;
                    }
                    case ModelOneMode.RESET: {
                        tokenCookie.reset();
                        break;
                    }
                }
            },
        });

        return {
            session,
        };
    },
    view({ from }) {
        const session = from("session");

        const token = from("session", (value) => {
            return value.token;
        });

        const payload = from("session", ({ token, ...sessionWithoutToken }) => {
            return sessionWithoutToken;
        });

        const provided = from("session", (value) => {
            return value.exp > 0;
        });

        const permissions = from("session", (value) => {
            return value.permissions;
        });

        return {
            session,
            token,
            payload,
            provided,
            permissions,
        };
    },
    action({ handler }) {
        async function authenticate(key: string): Promise<Session> {
            const rsaWrapper = newRsaWrapper();
            const readKeyError = rsaWrapper.readPrivateKey(key);
            if (readKeyError) {
                throw readKeyError;
            }

            const challengeRequest = newHttpRequest("/api/auth/challenge/");
            const challengeCallError = await challengeRequest.call({ timeout: 2500 });
            if (challengeCallError) {
                throw challengeCallError;
            }

            let identity = "";
            let nonce = "";
            const challengeReadError = await challengeRequest.read((chunk) => {
                if (chunk.isEntity) {
                    identity = chunk.payload?.identity;
                    nonce = chunk.payload?.nonce;
                }
            });

            if (challengeReadError) {
                throw challengeReadError;
            }

            const [signature, signError] = rsaWrapper.signString(nonce);
            if (signError) {
                throw signError;
            }

            const verifyRequest = newHttpRequest("/api/auth/verify/");
            const verifyCallError = await verifyRequest.call({
                method: "POST",
                timeout: 2500,
                body: {
                    identity,
                    signature,
                    lifetime: "1h",
                },
            });

            if (verifyCallError) {
                throw verifyCallError;
            }

            const tokenCookie = useTokenCookie();
            const verifyReadError = await verifyRequest.read((chunk) => {
                if (chunk.isEntity) {
                    tokenCookie.set(chunk.payload.token);
                }
            });

            if (verifyReadError) {
                throw verifyReadError;
            }

            return tokenCookie.get();
        }

        const signin = handler<{ key: string }>(
            async ({ model, payload }) => {
                model.session.set(await authenticate(payload.key));
            },
            {
                concurrent: ActionConcurrent.BLOCK,
            },
        );

        const signinByFile = handler<{ file: File }>(
            async ({ model, payload }) => {
                const fileReaderWrapper = newFileReaderWrapper();
                const [keyString, readError] = await fileReaderWrapper.readString(payload.file);
                if (readError) {
                    throw readError;
                }

                model.session.set(await authenticate(keyString));

                await newDatabaseWrapper("auth").write("key", keyString);
            },
            {
                concurrent: ActionConcurrent.BLOCK,
            },
        );

        const signinByDatabase = handler(
            async ({ model }) => {
                const [keyString, readError] = await newDatabaseWrapper("auth").read("key");
                if (readError) {
                    throw readError;
                }

                model.session.set(await authenticate(keyString));
            },
            {
                concurrent: ActionConcurrent.BLOCK,
            },
        );

        const signout = handler(
            async ({ model }) => {
                await newDatabaseWrapper("auth").clear();

                model.session.reset();
            },
            {
                concurrent: ActionConcurrent.BLOCK,
            },
        );

        return {
            signin,
            signinByFile,
            signinByDatabase,
            signout,
        };
    },
});
