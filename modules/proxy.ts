import { createProxyServer } from "httpxy";
import { defineNuxtModule, useLogger } from "@nuxt/kit";

import type { IncomingMessage, OutgoingMessage } from "http";

export default defineNuxtModule({
    meta: {
        name: "proxy",
    },
    setup(_, nuxt) {
        const logger = useLogger("proxy");

        if (nuxt.options.dev) {
            const proxy = createProxyServer({
                target: "http://localhost/api/",
                changeOrigin: true,
            });

            nuxt.hook("nitro:config", (nitroConfig) => {
                if (!nitroConfig.devProxy) {
                    nitroConfig.devProxy = {};
                }

                nitroConfig.devProxy["/api/"] = proxy.options;
            });

            nuxt.hook("ready", () => {
                nuxt.server.upgrade = (req: IncomingMessage, socket: OutgoingMessage, head: Buffer) => {
                    if (req.url?.startsWith("/api/")) {
                        req.url = req.url.replace("/api/", "");

                        return proxy.ws(req, socket, proxy.options, head);
                    }

                    return nuxt.server.upgrade(req, socket, head);
                };
            });
        }

        logger.success("Proxy module setup complete");
    },
});
