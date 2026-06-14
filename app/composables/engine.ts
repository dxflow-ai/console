export const engineState = reactive({
    get parameter() {
        return engineStore.view.engineParameter.value;
    },
    get attribute() {
        return engineStore.view.engineAttribute.value;
    },
    get license() {
        return engineStore.view.engineLicense.value;
    },
    get stat() {
        return engineStore.view.engineStat.value;
    },
    get ping() {
        return engineStore.view.enginePing.value;
    },
});
