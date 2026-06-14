import type { NavigationMenuItem } from "@nuxt/ui";

export interface NavigationItem extends Omit<NavigationMenuItem, "ui"> {
    ui?: Record<string, any>;
}
