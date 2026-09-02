const THEME_PARAMETER = "theme";
const THEME_VALUES = ["light", "dark", "system"];

export default defineNuxtPlugin((nuxtApp) => {
    const theme = readUrlParameter(THEME_PARAMETER).toLowerCase();
    if (THEME_VALUES.includes(theme)) {
        useColorMode().preference = theme;
    }

    nuxtApp.hooks.hookOnce("app:mounted", () => {
        dropUrlParameter(THEME_PARAMETER);
    });
});
