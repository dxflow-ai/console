import { ViewClone, ActionConcurrent } from "@diphyx/harlemify/runtime";
import { saveAs } from "file-saver";
import { sleep } from "radash";

export const artifactStore = createStore({
    name: "artifact",
    model({ many }) {
        const list = many(artifactShape);

        return {
            list,
        };
    },
    view({ from }) {
        const list = from(
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
            {
                clone: ViewClone.SHALLOW,
            },
        );

        return {
            list,
        };
    },
    action({ handler }) {
        const get = handler<
            {
                directory?: string;
                pattern?: string;
                all?: boolean;
                depth?: number;
                offset?: number;
                limit?: number;
            },
            Artifact[]
        >(
            async ({ model, payload }) => {
                const { call, read } = newHttpRequest("/api/artifact/");

                const callError = await call({
                    query: {
                        directory: payload?.directory,
                        pattern: payload?.pattern,
                        all: payload?.all,
                        depth: payload?.depth,
                        offset: payload?.offset,
                        limit: payload?.limit,
                    },
                });

                if (callError) {
                    throw callError;
                }

                const artifacts: Artifact[] = [];
                const readError = await read((chunk) => {
                    if (chunk.isEntity) {
                        artifacts.push(chunk.payload);

                        model.list.add(chunk.payload, {
                            unique: true,
                        });
                    }
                });

                if (readError) {
                    throw readError;
                }

                return artifacts;
            },
            {
                concurrent: ActionConcurrent.SKIP,
            },
        );

        const list = handler<{ directory: string; pattern?: string }, Artifact[]>(
            async ({ model, view, payload }) => {
                const { call, read } = newHttpRequest("/api/artifact/");

                const callError = await call({
                    query: {
                        directory: payload.directory,
                        pattern: payload.pattern,
                    },
                });

                if (callError) {
                    throw callError;
                }

                const children: Artifact[] = [];
                const readError = await read((chunk) => {
                    if (chunk.isEntity) {
                        children.push(chunk.payload);
                    }
                });

                if (readError) {
                    throw readError;
                }

                let directory = payload.directory;
                if (children.length) {
                    directory = parentOf(children[0].identity);
                }

                const stale = view.list.value.filter((item) => {
                    return parentOf(item.identity) === directory;
                });

                if (stale.length) {
                    model.list.remove(stale);
                }

                model.list.add(children);

                return children;
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
                const { call, read } = newHttpRequest("/api/artifact/");

                const callError = await call({
                    method: "POST",
                    body: {
                        identity: payload.identity,
                        directory: payload.directory,
                        content: payload.content,
                        force: payload.force,
                    },
                });

                if (callError) {
                    throw callError;
                }

                let artifact: Artifact | null = null;
                const readError = await read((chunk) => {
                    if (chunk.isEntity) {
                        artifact = chunk.payload;
                    }
                });

                if (readError) {
                    throw readError;
                }

                if (artifact) {
                    model.list.add(artifact);
                }

                return artifact;
            },
            {
                concurrent: ActionConcurrent.BLOCK,
            },
        );

        const renameById = handler<
            { identity: string; new_identity: string },
            { identity: string; new_identity: string } | null
        >(
            async ({ model, view, payload }) => {
                const { call, read } = newHttpRequest("/api/artifact/rename/");

                const callError = await call({
                    method: "PUT",
                    body: {
                        identity: payload.identity,
                        new_identity: payload.new_identity,
                    },
                });

                if (callError) {
                    throw callError;
                }

                let result: { identity: string; new_identity: string } | null = null;
                const readError = await read((chunk) => {
                    if (chunk.isEntity) {
                        result = chunk.payload;
                    }
                });

                if (readError) {
                    throw readError;
                }

                if (result) {
                    const existing = view.list.value.find((item) => {
                        return item.identity === payload.identity;
                    });

                    model.list.remove({
                        identity: payload.identity,
                    });

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

        const removeById = handler<{ identity: string }>(
            async ({ model, view, payload }) => {
                const { call, read } = newHttpRequest("/api/artifact/");

                const callError = await call({
                    method: "DELETE",
                    query: {
                        identity: payload.identity,
                    },
                });

                if (callError) {
                    throw callError;
                }

                const readError = await read();
                if (readError) {
                    throw readError;
                }

                const removable = view.list.value.filter(({ identity }) => {
                    return identity === payload.identity || identity.startsWith(`${payload.identity}/`);
                });

                model.list.remove(removable);
            },
            {
                concurrent: ActionConcurrent.BLOCK,
            },
        );

        const removeBatch = handler<{ identities: string[] }, Array<{ identity: string; error?: string }>>(
            async ({ model, view, payload }) => {
                const { call, read } = newHttpRequest("/api/artifact/batch/");

                const callError = await call({
                    method: "DELETE",
                    body: {
                        identities: payload.identities,
                    },
                });

                if (callError) {
                    throw callError;
                }

                const results: Array<{ identity: string; error?: string }> = [];
                const readError = await read((chunk) => {
                    if (chunk.isEntity) {
                        results.push(chunk.payload);

                        if (!chunk.payload.error) {
                            const removable = view.list.value.filter(({ identity }) => {
                                return (
                                    identity === chunk.payload.identity ||
                                    identity.startsWith(`${chunk.payload.identity}/`)
                                );
                            });

                            model.list.remove(removable);
                        }
                    }
                });

                if (readError) {
                    throw readError;
                }

                return results;
            },
        );

        const upload = handler<{
            identity: string;
            file: File;
            force?: boolean;
            onProgress?: (progress: number) => void;
        }>(async ({ payload }) => {
            const { upload } = newHttpRequest("/api/artifact/upload/");

            const uploadError = await upload({
                method: "PUT",
                file: payload.file,
                query: {
                    identity: payload.identity,
                    force: payload.force,
                },
                progress: payload.onProgress,
            });

            if (uploadError) {
                throw uploadError;
            }

            await sleep(1200);
        });

        const downloadById = handler<
            {
                identity: string;
                onProgress?: (progress: number) => void;
            },
            { blob: Blob; name: string } | null
        >(async ({ payload }) => {
            const { download } = newHttpRequest("/api/artifact/download/");

            const [result, downloadError] = await download({
                method: "GET",
                query: {
                    identity: payload.identity,
                },
                progress: payload.onProgress,
            });

            if (downloadError) {
                throw downloadError;
            }

            return result;
        });

        const zipById = handler<
            {
                identity: string;
                quiet?: boolean;
                onProgress?: (progress: any) => void;
            },
            ArtifactZipResult | null
        >(async ({ payload }) => {
            const { call, read } = newHttpRequest("/api/artifact/zip/");

            const callError = await call({
                method: "PUT",
                body: {
                    identity: payload.identity,
                    quiet: payload.quiet,
                },
            });

            if (callError) {
                throw callError;
            }

            let result: ArtifactZipResult | null = null;
            const readError = await read((chunk) => {
                if (!chunk.isEntity) {
                    return;
                }

                if (chunk.payload.destination) {
                    result = chunk.payload;
                } else if (payload.onProgress) {
                    payload.onProgress(chunk.payload);
                }
            });

            if (readError) {
                throw readError;
            }

            return result;
        });

        const unzipById = handler<
            {
                identity: string;
                quiet?: boolean;
                onProgress?: (progress: any) => void;
            },
            ArtifactZipResult | null
        >(async ({ payload }) => {
            const { call, read } = newHttpRequest("/api/artifact/unzip/");

            const callError = await call({
                method: "PUT",
                body: {
                    identity: payload.identity,
                    quiet: payload.quiet,
                },
            });

            if (callError) {
                throw callError;
            }

            let result: ArtifactZipResult | null = null;
            const readError = await read((chunk) => {
                if (!chunk.isEntity) {
                    return;
                }

                if (chunk.payload.destination) {
                    result = chunk.payload;
                } else if (payload.onProgress) {
                    payload.onProgress(chunk.payload);
                }
            });

            if (readError) {
                throw readError;
            }

            return result;
        });

        const reset = handler(async ({ model }) => {
            model.list.reset();
        });

        return {
            get,
            list,
            create,
            upload,
            renameById,
            downloadById,
            zipById,
            unzipById,
            removeById,
            removeBatch,
            reset,
        };
    },
    compose({ action }) {
        async function refreshDirectory(directory: string) {
            await action.list({
                payload: {
                    directory,
                },
            });
        }

        async function createDirectory(identity: string) {
            await action.create({
                payload: {
                    identity,
                    directory: true,
                },
            });

            await refreshDirectory(parentOf(identity));
        }

        async function renameAndRefresh(identity: string, newIdentity: string) {
            await action.renameById({
                payload: {
                    identity,
                    new_identity: newIdentity,
                },
            });

            await refreshDirectory(parentOf(identity));
        }

        async function removeAndRefresh(identity: string) {
            await action.removeById({
                payload: {
                    identity,
                },
            });

            await refreshDirectory(parentOf(identity));
        }

        async function zipAndRefresh(identity: string) {
            await action.zipById({
                payload: {
                    identity,
                    quiet: true,
                },
            });

            await refreshDirectory(parentOf(identity));
        }

        async function unzipAndRefresh(identity: string) {
            await action.unzipById({
                payload: {
                    identity,
                    quiet: true,
                },
            });

            await refreshDirectory(parentOf(identity));
        }

        async function downloadAndSave(identity: string) {
            const result = await action.downloadById({
                payload: {
                    identity,
                },
            });

            if (result) {
                saveAs(result.blob, result.name);
            }
        }

        async function saveFile(identity: string, name: string, content: string) {
            const file = new File([content], name, {
                type: "text/plain",
            });

            await action.upload({
                payload: {
                    identity,
                    file,
                    force: true,
                },
            });
        }

        async function uploadDirectory(directory: string, files: File[]) {
            for (const file of files) {
                await action.upload({
                    payload: {
                        identity: `${directory}/${file.name}`,
                        file,
                        force: true,
                    },
                });
            }

            await refreshDirectory(directory);
        }

        return {
            createDirectory,
            renameAndRefresh,
            removeAndRefresh,
            zipAndRefresh,
            unzipAndRefresh,
            downloadAndSave,
            saveFile,
            uploadDirectory,
        };
    },
});
