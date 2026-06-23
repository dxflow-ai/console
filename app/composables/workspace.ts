const isMobile = useMediaQuery("(max-width: 767px)");

const sidebarOpen = ref(!isMobile.value);
const secondaryOpen = ref(false);
const secondaryFull = ref(false);

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

    return {
        isMobile,
        sidebarOpen,
        secondaryOpen,
        secondaryFull,
        toggleSidebar,
        closeSidebar,
        openSecondary,
        toggleSecondary,
        toggleSecondaryFull,
    };
}
