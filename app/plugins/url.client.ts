const THEME_VALUES = ["light", "dark", "system"];

export default defineNuxtPlugin((nuxtApp) => {
    const theme = readUrlParameter(THEME_PARAMETER).toLowerCase();
    if (THEME_VALUES.includes(theme)) {
        useColorMode().preference = theme;
    }

    // The router replays the initial url once the app is created, so the handoff
    // parameters can only be dropped after it settled, and through the router itself.
    nuxtApp.hooks.hookOnce("app:mounted", async () => {
        if (!dropUrlParameter(THEME_PARAMETER, TOKEN_PARAMETER)) {
            return;
        }

        const { pathname, search, hash } = window.location;

        await useRouter().replace(`${pathname}${search}${hash}`);
    });
});
