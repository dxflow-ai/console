<template>
    <div class="relative bg-default rounded-sm ring-1 ring-accented/25 overflow-hidden">
        <div :class="loaded ? 'animate-fade animate-delay-500' : 'opacity-0'" class="absolute inset-0 overflow-hidden">
            <div ref="element" class="relative size-full flex items-center justify-center overflow-visible" />
        </div>
        <template v-if="!loaded">
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                <UiIcon name="i-mingcute:loading-3-fill" class="size-5 animate-spin text-muted" />
            </div>
        </template>
    </div>
</template>

<script lang="ts" setup>
const props = defineProps({
    identity: {
        type: String,
        required: true,
    },
});

const { authorizedToken } = useSession();
const { scale } = useScale();
const { data: orderedShells } = useStoreView(shellStore, "list");

const theme = useColorMode();

const element = useTemplateRef("element");
const { width, height } = useElementSize(element);

const loaded = ref(false);

const webSocketWrapper = newWebSocketWrapper();
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
    scale,
    (value) => {
        terminalWrapper.setScale(value);
    },
    {
        debounce: 250,
        immediate: true,
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
        immediate: true,
    },
);

async function load() {
    loaded.value = false;

    const shell = orderedShells.value.find((s) => {
        return s.identity === props.identity;
    });
    if (shell?.state != "executed") {
        try {
            await shellStore.action.executeById({ payload: { identity: props.identity } });
        } catch (error) {
            loaded.value = true;
            return dangerToast("Failed to load terminal", error as Error);
        }
    }

    const connectError = await webSocketWrapper.connect({
        path: `/api/shell/${props.identity}/?authorization=${authorizedToken.value}`,
        onData(value) {
            terminalWrapper.tryWrite(atob(value));
        },
    });
    if (connectError) {
        loaded.value = true;
        return dangerToast("Failed to load terminal", connectError);
    }

    await terminalWrapper.attach({
        element: element.value as HTMLElement,
        onData(value) {
            webSocketWrapper.tryWrite(value);
        },
        onResize(columns, rows) {
            shellStore.action.resizeById({ payload: { identity: props.identity, columns, rows } });
        },
    });

    loaded.value = true;
}

onMounted(() => {
    load();
});

onUnmounted(() => {
    webSocketWrapper.close();
    terminalWrapper.dispose();
});
</script>

<style lang="css">
@import "@xterm/xterm/css/xterm.css";

.xterm-viewport,
.xterm-screen {
    cursor: text !important;
}
</style>
