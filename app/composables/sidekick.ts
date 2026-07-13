export type SidekickKey = "agent";

const expandedSidekicks = useLocalStorage("sidekick-expanded", new Set<SidekickKey>(["agent"]), {
    initOnMounted: true,
});

export function useSidekick() {
    function toggle(key: SidekickKey, available?: SidekickKey[]) {
        if (expandedSidekicks.value.has(key)) {
            const openCount = available
                ? available.filter((item) => {
                      return expandedSidekicks.value.has(item);
                  }).length
                : expandedSidekicks.value.size;

            if (openCount > 1) {
                expandedSidekicks.value.delete(key);
            }
        } else {
            expandedSidekicks.value.add(key);
        }
    }

    function expand(key: SidekickKey) {
        expandedSidekicks.value = new Set([key]);
    }

    return {
        expanded: expandedSidekicks,
        toggle,
        expand,
    };
}
