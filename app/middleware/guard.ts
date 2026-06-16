export default defineNuxtRouteMiddleware(() => {
    const { authorized } = useSession();
    if (authorized.value) {
        return;
    }

    return createError({
        statusCode: 401,
        message: "Need to be authenticated",
    });
});
