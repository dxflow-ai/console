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
        try {
            const removed = await executePrune();

            removed?.forEach(closeTabs);
        } catch (error) {
            dangerToast("Failed to prune shells", error as Error);
        }
    }

    async function remove(shell: Shell) {
        try {
            await executeRemove({
                payload: {
                    identity: shell.identity,
                },
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
        create,
        prune,
        remove,
    };
}
