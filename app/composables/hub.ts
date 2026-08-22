const query = ref("");

export function useHubCatalog() {
    const { data: workflows } = useStoreView(hubStore, "list");

    const { execute: executeSearch, loading: searching } = useStoreAction(hubStore, "search", {
        isolated: true,
    });

    async function load() {
        try {
            await executeSearch({
                payload: {
                    query: query.value,
                },
            });
        } catch (error) {
            dangerToast("Failed to load hub workflows", error as Error);
        }
    }

    function browse() {
        if (workflows.value.length) {
            return;
        }

        load();
    }

    watchDebounced(
        query,
        () => {
            load();
        },
        {
            debounce: 350,
        },
    );

    return {
        workflows,
        query,
        searching,
        browse,
    };
}
