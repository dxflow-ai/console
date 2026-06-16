import { jwtDecode } from "jwt-decode";

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
