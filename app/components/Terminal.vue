<template>
    <div class="relative bg-default rounded-sm ring-1 ring-accented/25 overflow-hidden">
        <Animate
            :state="loaded ? 'enter' : 'leave'"
            :attributes="{
                opacity: [0, 1],
            }"
            :transition="{
                delay: 500,
            }"
            class="absolute inset-0 overflow-hidden"
        >
            <div ref="element" class="relative size-full flex items-center justify-center overflow-visible" />
        </Animate>
        <Loading :active="!loaded" :size="5" transparent />
    </div>
</template>

<script lang="ts" setup>
import Animate from "~/components/Animate.vue";
import Loading from "~/components/Loading.vue";

const props = defineProps({
    identity: {
        type: String,
        required: true,
    },
});

const { authorizedToken } = useAuth();
const { scale } = useScale();
const { data: orderedShells } = useStoreView(shellStore, "ordered");

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
            await shellStore.action.execute({ payload: { identity: props.identity } });
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
            shellStore.action.resize({ payload: { identity: props.identity, columns, rows } });
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
