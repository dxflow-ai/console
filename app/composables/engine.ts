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

    const disks = computed(() => {
        const samples = engineStore.view.stat.value.disk;
        const point = (samples[samples.length - 1] ?? {}) as Record<string, { percent: number; value: number }>;

        return Object.entries(point).map(([name, usage]) => {
            return {
                name,
                percent: Math.round(usage.percent ?? 0),
            };
        });
    });

    const networks = computed(() => {
        const samples = engineStore.view.stat.value.network;
        const point = (samples[samples.length - 1] ?? {}) as Record<string, { sent: number; received: number }>;

        return Object.entries(point).map(([name, throughput]) => {
            return {
                name,
                sent: throughput.sent ?? 0,
                received: throughput.received ?? 0,
            };
        });
    });

    return {
        cpuHistory,
        memoryHistory,
        cpu,
        memory,
        disks,
        networks,
    };
}
