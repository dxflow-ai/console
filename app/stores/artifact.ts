import { ViewClone, ActionConcurrent } from "@diphyx/harlemify/runtime";

export const artifactStore = createStore({
    name: "artifact",
    model({ many }) {
        const list = many(artifactShape);
        return {
            list,
        };
    },
    view({ from }) {
        const ordered = from(
            "list",
            (items) => {
                return items.sort((first, second) => {
                    const firstIsDirectory = first.permission[0] === "d";
                    const secondIsDirectory = second.permission[0] === "d";
                    if (firstIsDirectory !== secondIsDirectory) {
                        return firstIsDirectory ? 1 : -1;
                    }

                    return first.name.localeCompare(second.name);
                });
            },
            { clone: ViewClone.SHALLOW },
        );
        return {
            ordered,
        };
    },
    action({ handler }) {
        const load = handler<unknown, Artifact[]>(
            async ({ model }) => {
                const request = newHttpRequest("/api/artifact/");
                const callError = await request.call();
                ensure(callError);

                const artifacts: Artifact[] = [];
                const readError = await request.read((chunk) => {
                    if (chunk.isEntity) {
                        artifacts.push(chunk.payload);
                        model.list.add(chunk.payload, { unique: true });
                    }
                });
                ensure(readError);

                return artifacts;
            },
            {
                concurrent: ActionConcurrent.SKIP,
            },
        );

        const create = handler<
            {
                identity: string;
                directory?: boolean;
                content?: string;
                force?: boolean;
            },
            Artifact | null
        >(
            async ({ model, payload }) => {
                const request = newHttpRequest("/api/artifact/");
                const callError = await request.call({
                    method: "POST",
                    body: {
                        identity: payload.identity,
                        directory: payload.directory,
                        content: payload.content,
                        force: payload.force,
                    },
                });
                ensure(callError);

                let artifact: Artifact | null = null;
                const readError = await request.read((chunk) => {
                    if (chunk.isEntity) {
                        artifact = chunk.payload;
                    }
                });
                ensure(readError);

                if (artifact) {
                    model.list.add(artifact);
                }

                return artifact;
            },
            {
                concurrent: ActionConcurrent.BLOCK,
            },
        );

        const rename = handler<
            { identity: string; new_identity: string },
            { identity: string; new_identity: string } | null
        >(
            async ({ model, view, payload }) => {
                const request = newHttpRequest("/api/artifact/rename/");
                const callError = await request.call({
                    method: "PUT",
                    body: {
                        identity: payload.identity,
                        new_identity: payload.new_identity,
                    },
                });
                ensure(callError);

                let result: { identity: string; new_identity: string } | null = null;
                const readError = await request.read((chunk) => {
                    if (chunk.isEntity) {
                        result = chunk.payload;
                    }
                });
                ensure(readError);

                if (result) {
                    // Preserve the existing entity's fields (permission/size/modified_at) so the
                    // renamed row stays well-formed for the ordered view's sort comparator.
                    const existing = view.ordered.value.find((item) => {
                        return item.identity === payload.identity;
                    });

                    model.list.remove({ identity: payload.identity });

                    model.list.add({
                        ...(existing ?? artifactShape.defaults()),
                        identity: result.new_identity,
                        name: result.new_identity.split("/").pop() || result.new_identity,
                    } as Artifact);
                }

                return result;
            },
            {
                concurrent: ActionConcurrent.BLOCK,
            },
        );

        const remove = handler<{ identity: string }>(
            async ({ model, payload }) => {
                const request = newHttpRequest("/api/artifact/");
                const callError = await request.call({
                    method: "DELETE",
                    query: {
                        identity: payload.identity,
                    },
                });
                ensure(callError);

                const readError = await request.read();
                ensure(readError);

                model.list.remove({ identity: payload.identity });
            },
            {
                concurrent: ActionConcurrent.BLOCK,
            },
        );

        const removeBatch = handler<{ identities: string[] }, Array<{ identity: string; error?: string }>>(
            async ({ model, payload }) => {
                const request = newHttpRequest("/api/artifact/batch/");
                const callError = await request.call({
                    method: "DELETE",
                    body: {
                        identities: payload.identities,
                    },
                });
                ensure(callError);

                const results: Array<{ identity: string; error?: string }> = [];
                const readError = await request.read((chunk) => {
                    if (chunk.isEntity) {
                        results.push(chunk.payload);

                        if (!chunk.payload.error) {
                            model.list.remove({ identity: chunk.payload.identity });
                        }
                    }
                });
                ensure(readError);

                return results;
            },
        );

        const upload = handler<{
            identity: string;
            file: File;
            force?: boolean;
            onProgress?: (progress: number) => void;
        }>(async ({ payload }) => {
            const request = newHttpRequest("/api/artifact/upload/");
            const uploadError = await request.upload({
                method: "PUT",
                file: payload.file,
                query: {
                    identity: payload.identity,
                    force: payload.force,
                },
                progress: payload.onProgress,
            });
            ensure(uploadError);

            await sleep(1200);
        });

        const download = handler<
            {
                identity: string;
                onProgress?: (progress: number) => void;
            },
            { blob: Blob; name: string } | null
        >(async ({ payload }) => {
            const request = newHttpRequest("/api/artifact/download/");
            const [result, downloadError] = await request.download({
                method: "GET",
                query: {
                    identity: payload.identity,
                },
                progress: payload.onProgress,
            });
            ensure(downloadError);

            return result;
        });

        const zip = handler<
            {
                identity: string;
                quiet?: boolean;
                onProgress?: (progress: any) => void;
            },
            ArtifactZipResult | null
        >(async ({ payload }) => {
            const request = newHttpRequest("/api/artifact/zip/");
            const callError = await request.call({
                method: "PUT",
                body: {
                    identity: payload.identity,
                    quiet: payload.quiet,
                },
            });
            ensure(callError);

            let result: ArtifactZipResult | null = null;
            const readError = await request.read((chunk) => {
                if (!chunk.isEntity) {
                    return;
                }

                if (chunk.payload.destination) {
                    result = chunk.payload;
                } else if (payload.onProgress) {
                    payload.onProgress(chunk.payload);
                }
            });
            ensure(readError);

            return result;
        });

        const unzip = handler<
            {
                identity: string;
                quiet?: boolean;
                onProgress?: (progress: any) => void;
            },
            ArtifactZipResult | null
        >(async ({ payload }) => {
            const request = newHttpRequest("/api/artifact/unzip/");
            const callError = await request.call({
                method: "PUT",
                body: {
                    identity: payload.identity,
                    quiet: payload.quiet,
                },
            });
            ensure(callError);

            let result: ArtifactZipResult | null = null;
            const readError = await request.read((chunk) => {
                if (!chunk.isEntity) {
                    return;
                }

                if (chunk.payload.destination) {
                    result = chunk.payload;
                } else if (payload.onProgress) {
                    payload.onProgress(chunk.payload);
                }
            });
            ensure(readError);

            return result;
        });

        const share = handler<
            {
                identities: string[];
                lifetime?: string;
                writable?: boolean;
            },
            ArtifactShareResult[]
        >(
            async ({ payload }) => {
                const request = newHttpRequest("/api/artifact/share/");
                const callError = await request.call({
                    method: "PUT",
                    body: {
                        identities: payload.identities,
                        lifetime: payload.lifetime,
                        writable: payload.writable,
                    },
                });
                ensure(callError);

                const results: ArtifactShareResult[] = [];
                const readError = await request.read((chunk) => {
                    if (chunk.isEntity) {
                        results.push(chunk.payload);
                    }
                });
                ensure(readError);

                return results;
            },
            {
                concurrent: ActionConcurrent.BLOCK,
            },
        );

        const reset = handler(async ({ model }) => {
            model.list.reset();
        });
        return {
            load,
            create,
            rename,
            upload,
            download,
            zip,
            unzip,
            share,
            remove,
            removeBatch,
            reset,
        };
    },
    compose({ action }) {
        async function uploadAndRefresh(payload: {
            identity: string;
            file: File;
            force?: boolean;
            onProgress?: (progress: number) => void;
        }) {
            await action.upload({ payload });
            await action.load();
        }

        return {
            uploadAndRefresh,
        };
    },
});
