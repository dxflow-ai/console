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
