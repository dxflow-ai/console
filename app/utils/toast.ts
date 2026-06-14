import type { ButtonProps } from "@nuxt/ui";

const closePropeties: Partial<ButtonProps> = {
    size: "xs",
    ui: {
        leadingIcon: "relative top-0.5 size-3",
    },
};

function resolveDescription(value: any, fallback: string) {
    const description = String(value?.message || value || "")
        .trim()
        .replace(/^\[(.*?)\]/gi, "$1")
        .replace(/^[^a-z]/gi, "");
    return description || fallback;
}

export async function infoToast(title: string, description?: any) {
    const { add } = useToast();
    add({
        title,
        description: resolveDescription(description, "Further information is not available"),
        color: "blue",
        icon: "i-mingcute:information-line",
        close: closePropeties,
    });

    await sleep(250);
}

export async function successToast(title: string, description?: any) {
    const { add } = useToast();
    add({
        title,
        description: resolveDescription(description, "Everything is working as intended"),
        color: "green",
        icon: "i-mingcute:check-circle-line",
        close: closePropeties,
    });

    await sleep(250);
}

export async function warningToast(title: string, description?: any) {
    const { add } = useToast();
    add({
        title,
        description: resolveDescription(description, "An issues were detected"),
        color: "amber",
        icon: "i-mingcute:warning-line",
        close: closePropeties,
    });

    await sleep(250);
}

export async function dangerToast(title: string, description?: any) {
    const { add } = useToast();
    add({
        title,
        description: resolveDescription(description, "An unexpected error occurred"),
        color: "red",
        icon: "i-mingcute:alert-line",
        close: closePropeties,
    });

    await sleep(250);
}

export interface UseConfirmToastOptions<T = any> {
    id: string;
    icon: string;
    color: "neutral" | "primary" | "red" | "green" | "amber" | "blue" | "cyan" | "teal";
    title: (payload: T) => string;
    description: (payload: T) => string;
    confirm: (payload: T) => void | Promise<void>;
    cancel?: (payload: T) => void | Promise<void>;
}

const shortcuts: Record<string, ReturnType<typeof defineShortcuts>> = {};
export function useConfirmToast<T = any>(options: UseConfirmToastOptions<T>) {
    const toast = useToast();
    function open(payload: T = {} as T) {
        if (shortcuts[options.id]) {
            return;
        }

        function cancelHandler() {
            const shortcut = shortcuts[options.id];
            if (shortcut) {
                shortcut();

                delete shortcuts[options.id];
            }

            toast.remove(options.id);

            if (options.cancel) {
                options.cancel(payload);
            }
        }

        function confirmHandler() {
            const shortcut = shortcuts[options.id];
            if (shortcut) {
                shortcut();

                delete shortcuts[options.id];
            }

            toast.remove(options.id);
            options.confirm(payload);
        }

        shortcuts[options.id] = defineShortcuts({
            escape() {
                cancelHandler();
            },
            enter() {
                confirmHandler();
            },
        });

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
                        cancelHandler();
                    },
                },
                {
                    label: "Confirm",
                    color: options.color,
                    onClick() {
                        confirmHandler();
                    },
                },
            ],
        });
    }

    function close() {
        const shortcut = shortcuts[options.id];
        if (shortcut) {
            shortcut();

            delete shortcuts[options.id];
        }

        toast.remove(options.id);
    }

    return {
        open,
        close,
    };
}
