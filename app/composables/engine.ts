export const engineState = reactive({
    get parameter() {
        return engineStore.view.parameter.value;
    },
    get attribute() {
        return engineStore.view.attribute.value;
    },
    get license() {
        return engineStore.view.license.value;
    },
    get stat() {
        return engineStore.view.stat.value;
    },
    get ping() {
        return engineStore.view.ping.value;
    },
});
