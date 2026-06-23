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

        if (position === "secondary") {
            openSecondary();
        }
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

    function openWorkflow(payload: { workflow: Workflow }) {
        openTab("primary", {
            key: `workflow:${payload.workflow.identity}:diagram`,
            kind: "workflow",
            label: payload.workflow.name,
            icon: "i-hugeicons:git-branch",
            payload: {
                workflow: payload.workflow,
                view: "diagram",
            },
        });

        openTab("secondary", {
            key: `workflow:${payload.workflow.identity}:logs`,
            kind: "workflow",
            label: payload.workflow.name,
            icon: "i-hugeicons:git-branch",
            payload: {
                workflow: payload.workflow,
                view: "logs",
            },
        });
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
