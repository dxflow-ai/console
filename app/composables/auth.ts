export function useAuth() {
    const core = useAuthCore("authorization");

    const minimumLifetime = 1000 * 60 * 5;

    const authorizedPermissions = computed<string[]>(() => {
        if (core.authorized.value) {
            return core.payload.value.permissions;
        }

        return [];
    });

    async function signin(key: string): Promise<MaybeError> {
        const rsaWrapper = newRsaWrapper();
        const readFileError = rsaWrapper.readPrivateKey(key);
        if (readFileError) {
            return readFileError;
        }

        const challengeRequest = newHttpRequest("/api/auth/challenge/");
        const executeChallengeError = await challengeRequest.call({
            timeout: 2500,
        });
        if (executeChallengeError) {
            return executeChallengeError;
        }

        let identity = "";
        let nonce = "";
        const readChallengeError = await challengeRequest.read((chunk) => {
            if (chunk.isEntity) {
                identity = chunk.payload?.identity;
                nonce = chunk.payload?.nonce;
            }
        });
        if (readChallengeError) {
            return readChallengeError;
        }

        const [signature, signError] = rsaWrapper.signString(nonce);
        if (signError) {
            return signError;
        }

        const verifyRequest = newHttpRequest("/api/auth/verify/");
        const executeVerifyError = await verifyRequest.call({
            method: "POST",
            timeout: 2500,
            body: {
                identity: identity,
                signature: signature,
                lifetime: "1h",
            },
        });
        if (executeVerifyError) {
            return executeVerifyError;
        }

        const readVerifyError = await verifyRequest.read((chunk) => {
            if (chunk.isEntity) {
                core.setAuthorization(chunk.payload.token);
            }
        });
        if (readVerifyError) {
            return readVerifyError;
        }

        return null;
    }

    async function signinByFile(file: File): Promise<MaybeError> {
        const fileReaderWrapper = newFileReaderWrapper();
        const [keyString, readError] = await fileReaderWrapper.readString(file);
        if (readError) {
            return readError;
        }

        const signinError = await signin(keyString);
        if (signinError) {
            return signinError;
        }

        await newDatabaseWrapper("auth").write("key", keyString);

        return null;
    }

    async function signinByDatabase(): Promise<MaybeError> {
        const [keyString, readError] = await newDatabaseWrapper("auth").read("key");
        if (readError) {
            return readError;
        }

        const signinError = await signin(keyString);
        if (signinError) {
            return signinError;
        }

        return null;
    }

    async function signout() {
        await newDatabaseWrapper("auth").clear();

        core.resetAuthorization();
    }

    function authGuard() {
        if (core.authorized.value) {
            return;
        }

        throw createError({
            statusCode: 403,
            statusMessage: "Required authorization",
        });
    }

    return {
        payload: core.payload,
        provided: core.provided,
        lifetime: core.lifetime,
        minimumLifetime,
        authorized: core.authorized,
        authorizedToken: core.authorizedToken,
        authorizedPermissions,
        setAuthorization: core.setAuthorization,
        resetAuthorization: core.resetAuthorization,
        signin,
        signinByDatabase,
        signinByFile,
        signout,
        authGuard,
    };
}
