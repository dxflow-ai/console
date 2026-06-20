export const useSharedTimestamp = createGlobalState(() => {
    return useTimestamp({
        interval: 1000,
    });
});

export function useTokenCookie() {
    return useCookie<string>("authorization", {
        watch: "shallow",
        sameSite: "strict",
        secure: !import.meta.dev,
        default() {
            return "";
        },
    });
}

export function useSession() {
    const { data: session } = useStoreView(sessionStore, "session");

    const timestamp = useSharedTimestamp();

    const provided = computed(() => {
        return session.value.exp > 0;
    });

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

    return {
        provided,
        expiration,
        authorized,
        authorizedToken,
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
    }

    return {
        signout,
    };
}
