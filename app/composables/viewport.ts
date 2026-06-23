export function useViewport(options?: { min?: number; max?: number; step?: number }) {
    const min = options?.min ?? 0.5;
    const max = options?.max ?? 1.5;
    const step = options?.step ?? 0.1;

    const scale = ref(1);
    const offsetX = ref(0);
    const offsetY = ref(0);
    const panning = ref(false);

    let startX = 0;
    let startY = 0;
    let originX = 0;
    let originY = 0;

    let viewportElement: HTMLElement | null = null;
    let contentElement: HTMLElement | null = null;

    const style = computed(() => {
        return {
            transform: `translate(${offsetX.value}px, ${offsetY.value}px) scale(${scale.value})`,
            transformOrigin: "0 0",
        };
    });

    function clamp(value: number) {
        return Math.min(max, Math.max(min, value));
    }

    function zoomTo(next: number, pivotX?: number, pivotY?: number) {
        const target = clamp(Number(next.toFixed(2)));

        if (pivotX !== undefined && pivotY !== undefined) {
            const ratio = target / scale.value;

            offsetX.value = pivotX - (pivotX - offsetX.value) * ratio;
            offsetY.value = pivotY - (pivotY - offsetY.value) * ratio;
        }

        scale.value = target;
    }

    function onWheel(event: WheelEvent) {
        event.preventDefault();

        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        const delta = event.deltaY < 0 ? step : -step;

        zoomTo(scale.value + delta, event.clientX - rect.left, event.clientY - rect.top);
    }

    function onPointerDown(event: PointerEvent) {
        if (event.button !== 0) {
            return;
        }

        const target = event.target as HTMLElement;
        if (target.closest("button, a, input")) {
            return;
        }

        panning.value = true;
        startX = event.clientX;
        startY = event.clientY;
        originX = offsetX.value;
        originY = offsetY.value;

        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    }

    function onPointerMove(event: PointerEvent) {
        if (!panning.value) {
            return;
        }

        offsetX.value = originX + (event.clientX - startX);
        offsetY.value = originY + (event.clientY - startY);
    }

    function onPointerUp(event: PointerEvent) {
        panning.value = false;

        (event.currentTarget as HTMLElement).releasePointerCapture?.(event.pointerId);
    }

    function center(viewport?: HTMLElement | null, content?: HTMLElement | null) {
        if (viewport) {
            viewportElement = viewport;
        }

        if (content) {
            contentElement = content;
        }

        if (!viewportElement || !contentElement) {
            return;
        }

        const viewportWidth = viewportElement.clientWidth;
        const viewportHeight = viewportElement.clientHeight;
        const contentWidth = contentElement.offsetWidth;
        const contentHeight = contentElement.offsetHeight;

        if (!contentWidth || !contentHeight) {
            return;
        }

        scale.value = clamp(Math.min(viewportWidth / contentWidth, viewportHeight / contentHeight));

        offsetX.value = (viewportWidth - contentWidth * scale.value) / 2;
        offsetY.value = (viewportHeight - contentHeight * scale.value) / 2;
    }

    return {
        panning,
        style,
        onWheel,
        onPointerDown,
        onPointerMove,
        onPointerUp,
        center,
    };
}
