export const useSharedTimestamp = createGlobalState(() => {
    return useTimestamp({
        interval: 1000,
    });
});
