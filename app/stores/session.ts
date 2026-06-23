import { ModelOneMode, ActionConcurrent } from "@diphyx/harlemify/runtime";

export const sessionStore = createStore({
    name: "session",
    model({ one }) {
        const session = one(sessionShape, {
            default() {
                return decodeToken(useTokenCookie().value);
            },
            post({ mode, state }) {
                if (mode === ModelOneMode.SET) {
                    useTokenCookie().value = state.token;
                }
            },
        });

        return {
            session,
        };
    },
    view({ from }) {
        const session = from("session");

        return {
            session,
        };
    },
    action({ handler }) {
        async function authenticate(key: string, lifetime: string): Promise<Session> {
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

            let nonce = "";
            let identity = "";
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
                    lifetime,
                },
            });

            if (verifyCallError) {
                throw verifyCallError;
            }

            let token = "";
            const verifyReadError = await verifyRequest.read((chunk) => {
                if (chunk.isEntity) {
                    token = chunk.payload.token;
                }
            });

            if (verifyReadError) {
                throw verifyReadError;
            }

            return decodeToken(token);
        }

        const signinByFile = handler<{ file: File; lifetime: string }>(
            async ({ model, payload }) => {
                const fileReaderWrapper = newFileReaderWrapper();
                const [keyString, readError] = await fileReaderWrapper.readString(payload.file);
                if (readError) {
                    throw readError;
                }

                const session = await authenticate(keyString, payload.lifetime);

                model.session.set(session);

                await newDatabaseWrapper("auth").write("key", keyString);
            },
            {
                concurrent: ActionConcurrent.BLOCK,
            },
        );

        const signinByDatabase = handler<{ lifetime: string }>(
            async ({ model, payload }) => {
                const [keyString, readError] = await newDatabaseWrapper("auth").read("key");
                if (readError) {
                    throw readError;
                }

                if (!keyString) {
                    throw new Error("No stored key");
                }

                model.session.set(await authenticate(keyString, payload.lifetime));
            },
            {
                concurrent: ActionConcurrent.BLOCK,
            },
        );

        return {
            signinByFile,
            signinByDatabase,
        };
    },
    compose({ model }) {
        async function signout(cleanup?: boolean) {
            if (cleanup) {
                await newDatabaseWrapper("auth").clear();
            }

            model.session.set(sessionShape.defaults());
        }

        return {
            signout,
        };
    },
});
