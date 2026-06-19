import { RSAKey, hextob64 } from "jsrsasign";

class RsaWrapper extends RSAKey {
    constructor() {
        super();
    }

    readPrivateKey(key: string): MaybeError {
        try {
            this.readPrivateKeyFromPEMString(key);

            return null;
        } catch (error: any) {
            return new Error(error?.message || error);
        }
    }

    signString(value: string): [string, MaybeError] {
        try {
            const signature = hextob64(this.sign(value, "sha256"));
            return [signature, null];
        } catch (error: any) {
            return ["", new Error(error?.message || error)];
        }
    }
}

export function newRsaWrapper() {
    const rsaWrapper = new RsaWrapper();

    return rsaWrapper;
}
