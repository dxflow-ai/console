import { sleep } from "radash";

function resolveDescription(value: any, fallback: string) {
    const description = String(value?.message || value || "")
        .trim()
        .replace(/^\[(.*?)\]/gi, "$1")
        .replace(/^[^a-z]/gi, "");

    return description || fallback;
}

export async function dangerToast(title: string, description?: any) {
    const { add } = useToast();

    add({
        title,
        description: resolveDescription(description, "An unexpected error occurred"),
        color: "red",
        icon: "i-mingcute:alert-line",
    });

    await sleep(250);
}

export interface UseConfirmToastOptions<T = any> {
    id: string;
    icon: string;
    color: "neutral" | "primary" | "green" | "red" | "blue" | "yellow";
    title: (payload: T) => string;
    description: (payload: T) => string;
    confirm: (payload: T) => void | Promise<void>;
    cancel?: (payload: T) => void | Promise<void>;
}

export function useConfirmToast<T = any>(options: UseConfirmToastOptions<T>) {
    const toast = useToast();

    const opened = ref(false);

    let payload = {} as T;

    function close() {
        if (!opened.value) {
            return;
        }

        opened.value = false;
        toast.remove(options.id);
    }

    function cancel() {
        if (!opened.value) {
            return;
        }

        close();
        options.cancel?.(payload);
    }

    function confirm() {
        if (!opened.value) {
            return;
        }

        close();
        options.confirm(payload);
    }

    defineShortcuts(
        computed(() => {
            if (!opened.value) {
                return {};
            }

            return {
                escape() {
                    cancel();
                },
                enter() {
                    confirm();
                },
            };
        }),
    );

    function open(nextPayload: T = {} as T) {
        if (opened.value) {
            return;
        }

        payload = nextPayload;
        opened.value = true;

        toast.add({
            id: options.id,
            icon: options.icon,
            color: options.color,
            title: options.title(payload),
            description: options.description(payload),
            close: false,
            duration: 0,
            actions: [
                {
                    label: "Cancel",
                    variant: "ghost",
                    color: options.color,
                    onClick() {
                        cancel();
                    },
                },
                {
                    label: "Confirm",
                    color: options.color,
                    onClick() {
                        confirm();
                    },
                },
            ],
        });
    }

    return {
        open,
        close,
    };
}
