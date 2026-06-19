<template>
    <div class="relative bg-default overflow-hidden">
        <div
            class="absolute inset-0 overflow-hidden"
            :class="{
                'opacity-0': loading,
            }"
        >
            <div ref="element" class="relative size-full flex items-center justify-center overflow-visible" />
        </div>
        <template v-if="loading">
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                <UiIcon class="size-5 animate-spin text-muted" name="i-mingcute:loading-3-fill" />
            </div>
        </template>
    </div>
</template>

<script lang="ts" setup>
import { defer } from "radash";

const props = defineProps({
    identity: {
        type: String,
        required: true,
    },
});

const theme = useColorMode();

const { scale } = useScale();
const { authorizedToken } = useSession();
const { data: shells } = useStoreView(shellStore, "list");

const element = useTemplateRef("element");
const { width, height } = useElementSize(element);

const loading = ref(false);

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

async function load() {
    terminalWrapper.setScale(scale.value);
    terminalWrapper.setTheme(theme.value);

    const shell = shells.value.find(({ identity }) => {
        return identity === props.identity;
    });

    if (shell?.state != "executed") {
        try {
            await shellStore.action.executeById({
                payload: {
                    identity: props.identity,
                },
            });
        } catch (error) {
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
        return dangerToast("Failed to load terminal", connectError);
    }

    await terminalWrapper.attach({
        element: element.value as HTMLElement,
        onData(value) {
            webSocketWrapper.tryWrite(value);
        },
        onResize(columns, rows) {
            shellStore.action.resizeById({
                payload: {
                    identity: props.identity,
                    columns,
                    rows,
                },
            });
        },
    });
}

async function loadWrapper() {
    return defer((cleanup) => {
        loading.value = true;

        cleanup(() => {
            loading.value = false;
        });

        return load();
    });
}

onMounted(() => {
    loadWrapper();
});

onUnmounted(() => {
    webSocketWrapper.close();
    terminalWrapper.dispose();
});
</script>
