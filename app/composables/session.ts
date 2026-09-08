import { tryit } from "radash";

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
    const { execute: executeSignout } = useStoreCompose(sessionStore, "signout");

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

        await executeSignout(true);
    }

    return {
        signout,
    };
}

export interface UseEngineChallengeOptions {
    enabled?: () => boolean;
}

export function useEngineChallenge(options?: UseEngineChallengeOptions) {
    const reachable = ref(false);
    const pending = ref(false);
    const probed = ref(false);

    async function probe() {
        pending.value = true;

        const request = newHttpRequest("/api/auth/challenge/");

        const [thrownError, returnedError] = await tryit(request.call)({ timeout: 2500 });
        if (!thrownError && !returnedError) {
            reachable.value = !(await request.read());
        }

        pending.value = false;
        probed.value = true;
    }

    watch(
        () => {
            return options?.enabled ? options.enabled() : true;
        },
        (value) => {
            if (value && !probed.value && !pending.value) {
                probe();
            }
        },
        {
            immediate: true,
        },
    );

    return {
        reachable,
        pending,
        probed,
    };
}
