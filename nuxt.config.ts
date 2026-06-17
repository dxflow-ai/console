export default defineNuxtConfig({
    ssr: false,
    app: {
        baseURL: "/",
        head: {
            title: "dxflow",
            link: [
                {
                    rel: "shortcut icon",
                    href: "/favicon.ico",
                },
                {
                    rel: "apple-touch-icon",
                    sizes: "512x512",
                    href: "/favicon.png",
                },
            ],
            meta: [
                {
                    name: "apple-mobile-web-app-title",
                    content: "dxflow",
                },
                {
                    name: "viewport",
                    content: "width=device-width, initial-scale=1.0",
                },
                {
                    name: "theme-color",
                    content: "#676eed",
                },
            ],
            bodyAttrs: {
                style: "overflow-x: hidden;",
            },
        },
    },
    css: ["~/assets/tailwind.css", "~/assets/custom.scss", "uplot/dist/uPlot.min.css"],
    modules: ["@diphyx/harlemify", "@nuxt/ui", "@vueuse/nuxt", "@nuxtjs/device"],
    harlemify: {
        logger: -999,
    },
    ui: {
        prefix: "ui",
        theme: {
            colors: ["zodiac", "neutral", "green", "red", "blue", "yellow"],
            defaultVariants: {
                size: "sm",
            },
        },
    },
    colorMode: {
        preference: "system",
        fallback: "light",
    },
    fonts: {
        provider: "google",
        defaults: {
            weights: [300, 700],
            styles: ["normal"],
        },
    },
    icon: {
        mode: "svg",
        serverBundle: false,
        clientBundle: {
            scan: {
                globInclude: ["app/**/*.{vue,ts}"],
                globExclude: ["node_modules", ".nuxt", ".output", "dist"],
            },
        },
    },
    typescript: {
        includeWorkspace: true,
    },
    sourcemap: {
        client: "hidden",
    },
    devtools: {
        enabled: false,
    },
    telemetry: {
        enabled: false,
    },
    imports: {
        dirs: ["~/types", "~/stores"],
    },
    vite: {
        build: {
            chunkSizeWarningLimit: 1500,
            rollupOptions: {
                output: {
                    manualChunks(id: any) {
                        if (id.includes("node_modules")) {
                            if (
                                id.includes("/vue/") ||
                                id.includes("/@vue/") ||
                                id.includes("/nuxt/") ||
                                id.includes("/@nuxt/")
                            ) {
                                return;
                            }

                            if (id.includes("/@vueuse/")) {
                                return "vueuse";
                            }

                            if (id.includes("/@unovis/")) {
                                return "unovis";
                            }

                            if (id.includes("/@xterm/") || id.includes("/xterm/")) {
                                return "terminal";
                            }

                            if (id.includes("/idb/")) {
                                return "data";
                            }

                            if (id.includes("/@iconify/") || id.includes("/iconify")) {
                                return "icons";
                            }
                        }
                    },
                },
            },
        },
    },
    compatibilityDate: "2025-05-15",
});
