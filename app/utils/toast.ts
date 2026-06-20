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
    color: "neutral" | "primary" | "green" | "red" | "blue" | "yellow";
    title: (payload: T) => string;
    description: (payload: T) => string;
}

type ConfirmResolver = (confirmed: boolean) => void;

export function useConfirmToast<T = any>(options: UseConfirmToastOptions<T>) {
    const toast = useToast();

    const opened = ref(false);

    let resolve: ConfirmResolver | null = null;

    function settle(confirmed: boolean) {
        if (!opened.value) {
            return;
        }

        opened.value = false;
        toast.remove(options.id);

        resolve?.(confirmed);
        resolve = null;
    }

    defineShortcuts(
        computed(() => {
            if (!opened.value) {
                return {};
            }

            return {
                escape() {
                    settle(false);
                },
                enter() {
                    settle(true);
                },
            };
        }),
    );

    function open(payload: T = {} as T) {
        if (opened.value) {
            return Promise.resolve(false);
        }

        opened.value = true;

        toast.add({
            id: options.id,
            color: options.color,
            title: options.title(payload),
            description: options.description(payload),
            close: false,
            duration: 0,
            actions: [
                {
                    label: "Cancel",
                    variant: "soft",
                    color: options.color,
                    onClick() {
                        settle(false);
                    },
                },
                {
                    label: "Confirm",
                    color: options.color,
                    onClick() {
                        settle(true);
                    },
                },
            ],
        });

        return new Promise<boolean>((next) => {
            resolve = next;
        });
    }

    return {
        open,
    };
}
