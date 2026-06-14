export const defaultScale = 1;
export const minScale = 1;
export const maxScale = 1.5;
export const stepScale = 0.05;

export function useScale() {
    const scale = useLocalStorage("scale", defaultScale, {
        shallow: true,
        initOnMounted: true,
    });
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

    function upScale() {
        if (scale.value < maxScale) {
            scale.value += stepScale;
        }
    }

    function downScale() {
        if (scale.value > minScale) {
            scale.value -= stepScale;
        }
    }

    function resetScale() {
        scale.value = defaultScale;
    }

    function calcScale(value: number) {
        return value * scale.value;
    }

    return {
        scale,
        styles,
        upScale,
        downScale,
        resetScale,
        calcScale,
    };
}
