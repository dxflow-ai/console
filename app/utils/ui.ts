// Shared presentational class helpers — keep selectable-item styling consistent
// across tab strips and nav lists (content tabs, panel tabs, modal nav).
export function tabItemClass(active: boolean): string {
    return active ? "bg-elevated text-default" : "text-muted hover:bg-elevated/50";
}
