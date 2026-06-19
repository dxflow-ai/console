const sidebarOpen = ref(true);
const secondaryOpen = ref(false);
const secondaryFull = ref(false);

export function useWorkspace() {
    function toggleSidebar() {
        sidebarOpen.value = !sidebarOpen.value;
    }

    function openSecondary() {
        secondaryOpen.value = true;
    }

    function toggleSecondary() {
        secondaryOpen.value = !secondaryOpen.value;

        if (!secondaryOpen.value) {
            secondaryFull.value = false;
        }
    }

    function toggleSecondaryFull() {
        secondaryFull.value = !secondaryFull.value;
    }

    return {
        sidebarOpen,
        secondaryOpen,
        secondaryFull,
        toggleSidebar,
        openSecondary,
        toggleSecondary,
        toggleSecondaryFull,
    };
}

export type ExplorerKey = "workflow" | "artifact" | "shell";

const expandedExplorers = ref<Set<ExplorerKey>>(new Set(["workflow"]));

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

export const defaultScale = 1;

const scale = useLocalStorage("scale", defaultScale, {
    shallow: true,
    initOnMounted: true,
});

export function useScale() {
    const styles = computed(() => {
        return {
            "--spacing": `${0.25 * scale.value}rem`,
            "--text-xs": `${0.75 * scale.value}rem`,
            "--text-sm": `${0.875 * scale.value}rem`,
            "--text-md": `${1 * scale.value}rem`,
            "--text-base": `${1 * scale.value}rem`,
            "--text-lg": `${1.125 * scale.value}rem`,
            "--text-xl": `${1.25 * scale.value}rem`,
            "--text-2xl": `${1.5 * scale.value}rem`,
            "--text-3xl": `${1.875 * scale.value}rem`,
            "--text-4xl": `${2.25 * scale.value}rem`,
            "--text-5xl": `${3 * scale.value}rem`,
            "--text-6xl": `${3.75 * scale.value}rem`,
            "--text-7xl": `${4.5 * scale.value}rem`,
            "--text-8xl": `${6 * scale.value}rem`,
            "--text-9xl": `${8 * scale.value}rem`,
        };
    });

    return {
        scale,
        styles,
    };
}

export type ActivityMessage = {
    key: string;
    message: string;
};

const activities = ref<ActivityMessage[]>([]);

export function useActivity() {
    const current = computed<ActivityMessage | null>(() => {
        return activities.value[activities.value.length - 1] ?? null;
    });

    function start(key: string, message: string) {
        const existing = activities.value.find((item) => {
            return item.key === key;
        });

        if (existing) {
            existing.message = message;
        } else {
            activities.value.push({ key, message });
        }
    }

    function update(key: string, message: string) {
        start(key, message);
    }

    function finish(key: string) {
        const index = activities.value.findIndex((item) => {
            return item.key === key;
        });

        if (index !== -1) {
            activities.value.splice(index, 1);
        }
    }

    return {
        activities,
        current,
        start,
        update,
        finish,
    };
}
