export type ContentTab = {
    key: string;
    kind: "artifact" | "workflow";
    label: string;
    icon: string;
    payload: any;
};

const tabs = ref<ContentTab[]>([]);
const activeKey = ref<MaybeString>();

export function useTabs() {
    const activeTab = computed<ContentTab | null>(() => {
        return (
            tabs.value.find((item) => {
                return item.key === activeKey.value;
            }) ?? null
        );
    });

    function openTab(tab: ContentTab) {
        const existing = tabs.value.find((item) => {
            return item.key === tab.key;
        });

        if (!existing) {
            tabs.value.push(tab);
        }

        activeKey.value = tab.key;
    }

    function closeTab(key: string) {
        const index = tabs.value.findIndex((item) => {
            return item.key === key;
        });

        if (index === -1) {
            return;
        }

        tabs.value.splice(index, 1);

        if (activeKey.value === key) {
            const next = tabs.value[index] ?? tabs.value[index - 1];
            activeKey.value = next?.key;
        }
    }

    function setActive(key: string) {
        activeKey.value = key;
    }

    return {
        tabs,
        activeKey,
        activeTab,
        openTab,
        closeTab,
        setActive,
    };
}
