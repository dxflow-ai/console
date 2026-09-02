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
    return takeUrlParameter(TOKEN_PARAMETER);
}
