<template>
    <div class="relative bg-default overflow-hidden">
        <div
            class="absolute inset-0 overflow-hidden"
            :class="{
                'opacity-0': loading,
            }"
        >
            <ShellTerminal ref="terminal" @data="onData" @resize="onResize" />
        </div>
        <Loading :active="loading" />
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

const { authorizedToken } = useSession();
const { data: shells } = useStoreView(shellStore, "list");

const terminal = useTemplateRef<{ attach: () => Promise<void>; write: (data: string) => void }>("terminal");

const loading = ref(false);

const webSocketWrapper = newWebSocketWrapper();

function onData(value: string) {
    webSocketWrapper.tryWrite(value);
}

function onResize(columns: number, rows: number) {
    shellStore.action.resizeById({
        payload: {
            identity: props.identity,
            columns,
            rows,
        },
    });
}

async function load() {
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
            terminal.value?.write(atob(value));
        },
    });

    if (connectError) {
        return dangerToast("Failed to load terminal", connectError);
    }

    await terminal.value?.attach();
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
});
</script>
