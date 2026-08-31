import { jwtDecode } from "jwt-decode";

const TOKEN_PARAMETER = "token";

export function decodeToken(token: string, fallback: Session = sessionShape.defaults()): Session {
    if (!token) {
        return fallback;
    }

    let payload: JwtPayload = {};
    try {
        payload = jwtDecode<JwtPayload>(token);
    } catch {
        return fallback;
    }

    return {
        token,
        sub: payload.sub || fallback.sub,
        exp: payload.exp || fallback.exp,
        identity: payload.identity || fallback.identity,
        writable: payload.writable ?? fallback.writable,
        permissions: payload.permissions || fallback.permissions,
    };
}

export function takeUrlToken(): string {
    const url = new URL(window.location.href);

    const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
    const token = hash.get(TOKEN_PARAMETER) || url.searchParams.get(TOKEN_PARAMETER) || "";
    if (!token) {
        return "";
    }

    hash.delete(TOKEN_PARAMETER);
    url.searchParams.delete(TOKEN_PARAMETER);

    const remaining = hash.toString();
    url.hash = remaining ? `#${remaining}` : "";

    window.history.replaceState(window.history.state, "", url.toString());

    return token;
}
