const scale = useLocalStorage("scale", 1.1, {
    shallow: true,
    initOnMounted: true,
});

const debouncedScale = refDebounced(scale, 250);

const styles = computed(() => {
    const output = {
        "--scale": `${debouncedScale.value}`,
    };

    return output;
});

export function useScale() {
    return {
        scale,
        styles,
    };
}
