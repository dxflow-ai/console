export type ActivityMessage = {
    key: string;
    message: string;
};

const sidebarOpen = ref(true);
const panelOpen = ref(false);
const panelFull = ref(false);

const activities = ref<ActivityMessage[]>([]);

export function useWorkspace() {
    function toggleSidebar() {
        sidebarOpen.value = !sidebarOpen.value;
    }

    function togglePanel() {
        panelOpen.value = !panelOpen.value;

        if (!panelOpen.value) {
            panelFull.value = false;
        }
    }

    function togglePanelFull() {
        panelFull.value = !panelFull.value;
    }

    return {
        sidebarOpen,
        panelOpen,
        panelFull,
        toggleSidebar,
        togglePanel,
        togglePanelFull,
    };
}

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
