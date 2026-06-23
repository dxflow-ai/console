export type ActivityMessage = {
    key: string;
    message: string;
};

const activities = ref<ActivityMessage[]>([]);

export function useActivity() {
    const current = computed<ActivityMessage | null>(() => {
        return activities.value[activities.value.length - 1] ?? null;
    });

    function start(key: string, message: string) {
        const existing = activities.value.find((item) => {
            return item.key === key;
        });

        if (existing) {
            existing.message = message;
        } else {
            activities.value.push({ key, message });
        }
    }

    function update(key: string, message: string) {
        start(key, message);
    }

    function finish(key: string) {
        const index = activities.value.findIndex((item) => {
            return item.key === key;
        });

        if (index !== -1) {
            activities.value.splice(index, 1);
        }
    }

    return {
        activities,
        current,
        start,
        update,
        finish,
    };
}
