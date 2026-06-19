const renamingIdentity = ref<MaybeString>(undefined);
const draftIdentity = ref<MaybeString>(undefined);

export function useArtifactActions() {
    const { closeTabsWhere } = useTabs();

    const { execute: executeCreateDirectory, active: creating } = useStoreCompose(artifactStore, "createDirectory");
    const { execute: executeRename, active: renaming } = useStoreCompose(artifactStore, "renameAndRefresh");
    const { execute: executeRemove, active: removing } = useStoreCompose(artifactStore, "removeAndRefresh");
    const { execute: executeZip, active: zipping } = useStoreCompose(artifactStore, "zipAndRefresh");
    const { execute: executeUnzip, active: unzipping } = useStoreCompose(artifactStore, "unzipAndRefresh");
    const { execute: executeDownload, active: downloading } = useStoreCompose(artifactStore, "downloadAndSave");
    const { execute: executeUpload, active: uploading } = useStoreCompose(artifactStore, "uploadDirectory");

    function startRename(identity: string, options?: { draft?: boolean }) {
        renamingIdentity.value = identity;
        draftIdentity.value = options?.draft ? identity : undefined;
    }

    function stopRename() {
        renamingIdentity.value = undefined;
        draftIdentity.value = undefined;
    }

    function isRenaming(identity: string) {
        return renamingIdentity.value === identity;
    }

    function isDraft(identity: string) {
        return draftIdentity.value === identity;
    }

    function closeTabs(identity: string) {
        const exact = `artifact:${identity}`;
        const prefix = `${exact}/`;

        closeTabsWhere((tab) => {
            return tab.key === exact || tab.key.startsWith(prefix);
        });
    }

    async function makeDirectory(directory: string, siblings: Artifact[]) {
        const names = siblings.map((item) => {
            return item.name;
        });

        const identity = `${directory}/${uniqueName(names, "new-folder")}`;

        try {
            await executeCreateDirectory(identity);

            startRename(identity, {
                draft: true,
            });
        } catch (error) {
            dangerToast("Failed to create folder", error as Error);
        }
    }

    async function commitRename(artifact: Artifact, next: string) {
        const name = next.trim();

        if (!name || name === artifact.name) {
            return stopRename();
        }

        try {
            await executeRename(artifact.identity, `${parentOf(artifact.identity)}/${name}`);

            closeTabs(artifact.identity);
        } catch (error) {
            dangerToast("Failed to rename", error as Error);
        } finally {
            stopRename();
        }
    }

    async function cancelRename(artifact: Artifact) {
        if (isDraft(artifact.identity)) {
            try {
                await executeRemove(artifact.identity);
            } catch (error) {
                dangerToast("Failed to discard folder", error as Error);
            }
        }

        stopRename();
    }

    async function upload(directory: string, files: File[]) {
        try {
            await executeUpload(directory, files);
        } catch (error) {
            dangerToast("Failed to upload", error as Error);
        }
    }

    async function download(artifact: Artifact) {
        try {
            await executeDownload(artifact.identity);
        } catch (error) {
            dangerToast("Failed to download", error as Error);
        }
    }

    async function zip(artifact: Artifact) {
        try {
            await executeZip(artifact.identity);
        } catch (error) {
            dangerToast("Failed to zip", error as Error);
        }
    }

    async function unzip(artifact: Artifact) {
        try {
            await executeUnzip(artifact.identity);
        } catch (error) {
            dangerToast("Failed to unzip", error as Error);
        }
    }

    async function remove(artifact: Artifact) {
        try {
            await executeRemove(artifact.identity);

            closeTabs(artifact.identity);
        } catch (error) {
            dangerToast("Failed to delete", error as Error);
        }
    }

    return {
        creating,
        renaming,
        removing,
        zipping,
        unzipping,
        downloading,
        uploading,
        isRenaming,
        startRename,
        makeDirectory,
        commitRename,
        cancelRename,
        upload,
        download,
        zip,
        unzip,
        remove,
    };
}
