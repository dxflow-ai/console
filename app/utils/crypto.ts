import { RSAKey, hextob64 } from "jsrsasign";

export function newRsaWrapper() {
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

    const rsaWrapper = new RsaWrapper();
    return rsaWrapper;
}
