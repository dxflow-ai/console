import { useJwt } from "@vueuse/integrations/useJwt";

export function useAuthCore(cookieName: string) {
    const authorization = useCookie(cookieName, {
        watch: "shallow",
        sameSite: "strict",
        secure: !import.meta.dev,
        default() {
            return "";
        },
    });
    const jwt = useJwt<JwtPayload>(authorization);

    const timestamp = useTimestamp({
        interval: 1000,
    });

    const payload = computed(() => {
        return {
            sub: jwt.payload.value?.sub || "",
            exp: jwt.payload.value?.exp || 0,
            identity: jwt.payload.value?.identity || "",
            writable: jwt.payload.value?.writable || false,
            permissions: jwt.payload.value?.permissions || [],
            expiration: (jwt.payload.value?.exp || 0) * 1000,
        };
    });
    const provided = computed(() => {
        return payload.value.expiration > 0;
    });

    const lifetime = computed(() => {
        return payload.value.expiration - timestamp.value;
    });
    const authorized = computed(() => {
        return provided.value && lifetime.value > 2;
    });
    const authorizedToken = computed(() => {
        if (authorized.value) {
            return authorization.value;
        }

        return "";
    });

    function setAuthorization(value: string) {
        authorization.value = value;
    }

    function resetAuthorization() {
        authorization.value = "";
    }

    return {
        payload,
        provided,
        lifetime,
        authorized,
        authorizedToken,
        setAuthorization,
        resetAuthorization,
    };
}
