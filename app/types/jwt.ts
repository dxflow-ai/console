export type JwtPayload = {
    sub?: string;
    exp?: number;
    identity?: string;
    writable?: boolean;
    permissions?: string[];
};
