export default defineNuxtConfig({
    ssr: false,
    nitro: {
        prerender: {
            // SPA (ssr: false) renders no content, so the crawler can't discover the
            // in-app routes. List them explicitly so each gets an index.html shell and
            // a hard reload / deep link resolves instead of 404ing on a static host.
            crawlLinks: false,
            routes: [
                "/",
                "/login",
                "/console/engine/overview/",
                "/console/workflow/list/",
                "/console/artifact/list/",
                "/console/shell/sessions/",
            ],
        },
    },
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
    css: ["~/assets/tailwind.css", "~/assets/custom.scss"],
    modules: ["@diphyx/harlemify", "@nuxt/ui", "@vueuse/nuxt", "@nuxtjs/device"],
    harlemify: {
        logger: -999,
    },
    ui: {
        prefix: "ui",
        theme: {
            colors: ["zodiac", "neutral", "teal", "emerald", "indigo", "cyan", "green", "red", "blue", "amber"],
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
    runtimeConfig: {
        public: {
            version: "0.0.0",
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
