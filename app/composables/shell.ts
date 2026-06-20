const busyIdentities = ref<Set<string>>(new Set());

export function useShellActions() {
    const { closeTabsWhere } = useTabs();

    const { execute: executeCreate, loading: creating } = useStoreAction(shellStore, "create", {
        isolated: true,
    });

    const { execute: executePrune, loading: pruning } = useStoreAction(shellStore, "prune", {
        isolated: true,
    });

    const { execute: executeRemove, loading: removing } = useStoreAction(shellStore, "removeById", {
        isolated: true,
    });

    const confirmPrune = useConfirmToast({
        id: "shell-prune",
        color: "red",
        title() {
            return "Prune shells";
        },
        description() {
            return "Remove all terminated shells?";
        },
    });

    function isBusy(identity: string) {
        return busyIdentities.value.has(identity);
    }

    async function withBusy<T>(identity: string, run: () => Promise<T>) {
        busyIdentities.value.add(identity);

        try {
            return await run();
        } finally {
            busyIdentities.value.delete(identity);
        }
    }

    function closeTabs(identity: string) {
        closeTabsWhere((tab) => {
            return tab.key === `shell:${identity}`;
        });
    }

    async function create() {
        try {
            return await executeCreate();
        } catch (error) {
            dangerToast("Failed to create shell", error as Error);
        }
    }

    async function prune() {
        const confirmed = await confirmPrune.open();
        if (!confirmed) {
            return;
        }

        try {
            const removed = await executePrune();

            removed?.forEach(closeTabs);
        } catch (error) {
            dangerToast("Failed to prune shells", error as Error);
        }
    }

    async function remove(shell: Shell) {
        try {
            await withBusy(shell.identity, () => {
                return executeRemove({
                    payload: {
                        identity: shell.identity,
                    },
                });
            });

            closeTabs(shell.identity);
        } catch (error) {
            dangerToast("Failed to delete shell", error as Error);
        }
    }

    return {
        creating,
        pruning,
        removing,
        isBusy,
        create,
        prune,
        remove,
    };
}
