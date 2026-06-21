export type ExplorerKey = "workflow" | "artifact" | "shell";

const expandedExplorers = useLocalStorage("explorer-expanded", new Set<ExplorerKey>(["workflow"]), {
    initOnMounted: true,
});

export function useExplorer() {
    function toggle(key: ExplorerKey) {
        if (expandedExplorers.value.has(key)) {
            if (expandedExplorers.value.size > 1) {
                expandedExplorers.value.delete(key);
            }
        } else {
            expandedExplorers.value.add(key);
        }
    }

    function expand(key: ExplorerKey) {
        expandedExplorers.value = new Set([key]);
    }

    return {
        expanded: expandedExplorers,
        toggle,
        expand,
    };
}
