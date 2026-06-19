export type PanePosition = "primary" | "secondary";

export type PaneTab = {
    key: string;
    kind: "artifact" | "workflow" | "shell";
    label: string;
    icon: string;
    payload: any;
};

const tabs = reactive<Record<PanePosition, PaneTab[]>>({
    primary: [],
    secondary: [],
});

const activeKey = reactive<Record<PanePosition, MaybeString>>({
    primary: undefined,
    secondary: undefined,
});

export function useTabs() {
    function openTab(position: PanePosition, tab: PaneTab) {
        const existing = tabs[position].find((item) => {
            return item.key === tab.key;
        });

        if (!existing) {
            tabs[position].push(tab);
        }

        activeKey[position] = tab.key;
    }

    function closeTab(position: PanePosition, key: string) {
        const list = tabs[position];

        const index = list.findIndex((item) => {
            return item.key === key;
        });

        if (index === -1) {
            return;
        }

        list.splice(index, 1);

        if (activeKey[position] === key) {
            const next = list[index] ?? list[index - 1];
            activeKey[position] = next?.key;
        }
    }

    function setActive(position: PanePosition, key: string) {
        activeKey[position] = key;
    }

    function closeTabsWhere(predicate: (tab: PaneTab) => boolean) {
        const positions: PanePosition[] = ["primary", "secondary"];

        for (const position of positions) {
            const keys = tabs[position].filter(predicate).map((tab) => {
                return tab.key;
            });

            for (const key of keys) {
                closeTab(position, key);
            }
        }
    }

    return {
        tabs,
        activeKey,
        openTab,
        closeTab,
        closeTabsWhere,
        setActive,
    };
}
