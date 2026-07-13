const isMobile = useMediaQuery("(max-width: 767px)");

const secondaryOpen = ref(false);
const secondaryFull = ref(false);

const sidebarOpen = useLocalStorage(
    "sidebar-open",
    () => {
        return !isMobile.value;
    },
    {
        initOnMounted: true,
    },
);

const sidekickOpen = useLocalStorage(
    "sidekick-open",
    () => {
        return false
    },
    {
        initOnMounted: true,
    },
);

export function useWorkspace() {
    function toggleSidebar() {
        sidebarOpen.value = !sidebarOpen.value;
    }

    function closeSidebar() {
        sidebarOpen.value = false;
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

    function toggleSidekick() {
        sidekickOpen.value = !sidekickOpen.value;
    }

    return {
        isMobile,
        sidebarOpen,
        secondaryOpen,
        secondaryFull,
        sidekickOpen,
        toggleSidebar,
        closeSidebar,
        openSecondary,
        toggleSecondary,
        toggleSecondaryFull,
        toggleSidekick,
    };
}
