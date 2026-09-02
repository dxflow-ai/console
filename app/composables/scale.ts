const scale = useLocalStorage("scale", 1, {
    shallow: true,
    initOnMounted: true,
});

const debouncedScale = refDebounced(scale, 250);

const styles = computed(() => {
    const output = {
        "--spacing": `${0.25 * debouncedScale.value}rem`,
        "--text-xs": `${0.75 * debouncedScale.value}rem`,
        "--text-sm": `${0.875 * debouncedScale.value}rem`,
        "--text-md": `${1 * debouncedScale.value}rem`,
        "--text-base": `${1 * debouncedScale.value}rem`,
        "--text-lg": `${1.125 * debouncedScale.value}rem`,
        "--text-xl": `${1.25 * debouncedScale.value}rem`,
        "--text-2xl": `${1.5 * debouncedScale.value}rem`,
        "--text-3xl": `${1.875 * debouncedScale.value}rem`,
        "--text-4xl": `${2.25 * debouncedScale.value}rem`,
        "--text-5xl": `${3 * debouncedScale.value}rem`,
        "--text-6xl": `${3.75 * debouncedScale.value}rem`,
        "--text-7xl": `${4.5 * debouncedScale.value}rem`,
        "--text-8xl": `${6 * debouncedScale.value}rem`,
        "--text-9xl": `${8 * debouncedScale.value}rem`,
    };

    return output;
});

export function useScale() {
    return {
        scale,
        styles,
    };
}
