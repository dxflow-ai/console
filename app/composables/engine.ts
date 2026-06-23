export function useEngineStats() {
    const cpuHistory = computed<number[]>(() => {
        const output: number[] = [];

        for (const points of engineStore.view.stat.value.cpu) {
            let cores = 0;
            let usage = 0;

            for (const key in points) {
                usage += points[key].user + points[key].system;
                cores++;
            }

            output.push(cores ? usage / cores : 0);
        }

        return output;
    });

    const memoryHistory = computed<number[]>(() => {
        const output: number[] = [];

        for (const points of engineStore.view.stat.value.memory) {
            output.push(points["physical"]?.percent ?? 0);
        }

        return output;
    });

    const cpu = computed(() => {
        return Math.round(cpuHistory.value[cpuHistory.value.length - 1] ?? 0);
    });

    const memory = computed(() => {
        return Math.round(memoryHistory.value[memoryHistory.value.length - 1] ?? 0);
    });

    const cores = computed(() => {
        return engineStore.view.attribute.value.cpu.cores || 0;
    });

    const model = computed(() => {
        return engineStore.view.attribute.value.cpu.model || "";
    });

    const memoryTotal = computed(() => {
        return engineStore.view.attribute.value.memory.physical || 0;
    });

    const disk = computed(() => {
        const inventory = engineStore.view.attribute.value.disk;
        const samples = engineStore.view.stat.value.disk;

        const size = inventory.reduce((total, item) => {
            return total + (item.size || 0);
        }, 0);

        const usedAt = (sample: Record<string, { percent: number }>) => {
            return inventory.reduce((total, item) => {
                const percent = (sample[item.path] ?? sample[item.name])?.percent || 0;

                return total + (percent / 100) * (item.size || 0);
            }, 0);
        };

        const used = usedAt((samples[samples.length - 1] ?? {}) as Record<string, { percent: number }>);

        return {
            count: inventory.length,
            used,
            size,
            percent: size ? Math.round((used / size) * 100) : 0,
            history: samples.map((sample) => {
                return size ? Math.round((usedAt(sample) / size) * 100) : 0;
            }),
        };
    });

    const network = computed(() => {
        const inventory = engineStore.view.attribute.value.network;
        const samples = engineStore.view.stat.value.network;

        const sumAt = (sample: Record<string, { sent: number; received: number }>, key: "sent" | "received") => {
            return inventory.reduce((total, item) => {
                return total + (sample[item.name]?.[key] || 0);
            }, 0);
        };

        const point = (samples[samples.length - 1] ?? {}) as Record<string, { sent: number; received: number }>;

        return {
            count: inventory.length,
            sent: sumAt(point, "sent"),
            received: sumAt(point, "received"),
            history: samples.map((sample) => {
                return sumAt(sample, "received");
            }),
        };
    });

    return {
        cpuHistory,
        memoryHistory,
        cpu,
        memory,
        cores,
        model,
        memoryTotal,
        disk,
        network,
    };
}
