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
    const { openSecondary } = useWorkspace();

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

    function openWorkflow(payload: { workflow: Workflow; view: string; step?: number }) {
        const position: PanePosition = payload.view === "logs" || payload.view === "events" ? "secondary" : "primary";

        openTab(position, {
            key: `workflow:${payload.workflow.identity}:${payload.view}${payload.step ?? ""}`,
            kind: "workflow",
            label: `${payload.workflow.name} · ${payload.view}`,
            icon: "i-mingcute:git-branch-line",
            payload,
        });

        if (position === "secondary") {
            openSecondary();
        }
    }

    function openArtifact(payload: { artifact: Artifact }) {
        openTab("primary", {
            key: `artifact:${payload.artifact.identity}`,
            kind: "artifact",
            label: payload.artifact.name,
            icon: fileIcon(payload.artifact.name),
            payload,
        });
    }

    function openShell(payload: { shell: Shell }) {
        openTab("secondary", {
            key: `shell:${payload.shell.identity}`,
            kind: "shell",
            label: payload.shell.identity,
            icon: "i-hugeicons:command-line",
            payload,
        });

        openSecondary();
    }

    return {
        tabs,
        activeKey,
        openTab,
        closeTab,
        closeTabsWhere,
        setActive,
        openWorkflow,
        openArtifact,
        openShell,
    };
}
