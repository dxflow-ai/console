import { jwtDecode } from "jwt-decode";

export const useSharedTimestamp = createGlobalState(() => {
    return useTimestamp({
        interval: 1000,
    });
});

export function useTokenCookie() {
    const token = useCookie<string>("authorization", {
        watch: "shallow",
        sameSite: "strict",
        secure: !import.meta.dev,
        default() {
            return "";
        },
    });

    function get(fallback: Session = sessionShape.defaults()): Session {
        if (!token.value) {
            return fallback;
        }

        let payload: JwtPayload = {};
        try {
            payload = jwtDecode<JwtPayload>(token.value);
        } catch {
            return fallback;
        }

        return {
            token: token.value,
            sub: payload.sub || fallback.sub,
            exp: payload.exp || fallback.exp,
            identity: payload.identity || fallback.identity,
            writable: payload.writable ?? fallback.writable,
            permissions: payload.permissions || fallback.permissions,
        };
    }

    function set(value: string) {
        token.value = value;
    }

    function reset() {
        token.value = "";
    }

    return {
        get,
        set,
        reset,
    };
}

export function useSession() {
    const { data: session } = useStoreView(sessionStore, "session");
    const { data: payload } = useStoreView(sessionStore, "payload");
    const { data: provided } = useStoreView(sessionStore, "provided");

    const timestamp = useSharedTimestamp();

    const expiration = computed(() => {
        return (session.value.exp || 0) * 1000;
    });

    const lifetime = computed(() => {
        return expiration.value - timestamp.value;
    });

    const authorized = computed(() => {
        return provided.value && lifetime.value > 2;
    });

    const authorizedToken = computed(() => {
        if (authorized.value) {
            return session.value.token;
        }

        return "";
    });

    const authorizedPermissions = computed(() => {
        if (authorized.value) {
            return session.value.permissions;
        }

        return [];
    });

    return {
        session,
        payload,
        provided,
        expiration,
        lifetime,
        authorized,
        authorizedToken,
        authorizedPermissions,
    };
}

export function useSessionActions() {
    const { execute: executeSignout } = useStoreAction(sessionStore, "signout");

    const confirmSignout = useConfirmToast({
        id: "signout-confirm",
        color: "neutral",
        title() {
            return "Sign Out";
        },
        description() {
            return "Are you sure you want to sign out?";
        },
    });

    async function signout() {
        const confirmed = await confirmSignout.open();
        if (!confirmed) {
            return;
        }

        await executeSignout();

        await navigateTo({
            name: "auth",
        });
    }

    return {
        signout,
    };
}
