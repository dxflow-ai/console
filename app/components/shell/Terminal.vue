<template>
    <div ref="terminal-element" class="relative flex size-full items-center justify-center overflow-visible" />
</template>

<script lang="ts" setup>
const emit = defineEmits({
    data(value: string) {
        return true;
    },
    resize(columns: number, rows: number) {
        return true;
    },
});

const theme = useColorMode();

const { scale } = useScale();

const terminalElement = useTemplateRef<HTMLDivElement>("terminal-element");
const { width, height } = useElementSize(terminalElement);

const terminalWrapper = newTerminalWrapper();

watchDebounced(
    () => {
        return width.value * height.value;
    },
    () => {
        terminalWrapper.fitAddon.fit();
    },
    {
        debounce: 250,
    },
);

watchDebounced(
    () => {
        return scale.value;
    },
    (value) => {
        terminalWrapper.setScale(value);
    },
    {
        debounce: 250,
    },
);

watchDebounced(
    () => {
        return theme.value;
    },
    (value) => {
        terminalWrapper.setTheme(value);
    },
    {
        debounce: 250,
    },
);

async function attach() {
    terminalWrapper.setScale(scale.value);
    terminalWrapper.setTheme(theme.value);

    await terminalWrapper.attach({
        element: terminalElement.value,
        onData(value) {
            emit("data", value);
        },
        onResize(columns, rows) {
            emit("resize", columns, rows);
        },
    });
}

function write(data: string) {
    terminalWrapper.tryWrite(data);
}

onUnmounted(() => {
    terminalWrapper.dispose();
});

defineExpose({
    attach,
    write,
});
</script>
