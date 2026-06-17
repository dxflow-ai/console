export const useSharedTimestamp = createGlobalState(() => {
    return useTimestamp({
        interval: 1000,
    });
});

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
