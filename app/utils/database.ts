import { openDB } from "idb";
import { utf8tohex, hextoutf8 } from "jsrsasign";

import type { IDBPDatabase } from "idb";

class DatabaseWrapper {
    name: string;
    version: number;

    client!: IDBPDatabase<unknown>;

    constructor(name: string, version: number = 0) {
        this.name = utf8tohex(name);
        this.version = version || 1;
    }

    async connect(): Promise<MaybeError> {
        if (this.client) {
            return null;
        }

        try {
            this.client = await openDB(this.name, this.version, {
                upgrade: (instance) => {
                    instance.createObjectStore(this.name);
                },
            });

            return null;
        } catch (error: any) {
            return new Error(error?.message || error);
        }
    }

    async read(key: string): Promise<[string, MaybeError]> {
        try {
            const connectError = await this.connect();
            if (connectError) {
                throw connectError;
            }

            const value = await this.client.get(this.name, utf8tohex(key));
            if (value === undefined) {
                return ["", null];
            }

            return [hextoutf8(value), null];
        } catch (error: any) {
            return ["", new Error(error?.message || error)];
        }
    }

    async write(key: string, value: any): Promise<MaybeError> {
        try {
            const connectError = await this.connect();
            if (connectError) {
                throw connectError;
            }

            await this.client.put(this.name, utf8tohex(value), utf8tohex(key));

            return null;
        } catch (error: any) {
            return new Error(error?.message || error);
        }
    }

    async remove(key: string): Promise<MaybeError> {
        try {
            const connectError = await this.connect();
            if (connectError) {
                throw connectError;
            }

            await this.client.delete(this.name, utf8tohex(key));

            return null;
        } catch (error: any) {
            return new Error(error?.message || error);
        }
    }

    async clear(): Promise<MaybeError> {
        try {
            const connectError = await this.connect();
            if (connectError) {
                throw connectError;
            }

            await this.client.clear(this.name);

            return null;
        } catch (error: any) {
            return new Error(error?.message || error);
        }
    }
}

export function newDatabaseWrapper(name: string, version: number = 0) {
    const databaseWrapper = new DatabaseWrapper(name, version);

    return databaseWrapper;
}
