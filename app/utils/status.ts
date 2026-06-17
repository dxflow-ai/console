// Single source of truth for status → dot color across the app (workflow, step,
// shell). Keeps the meaning consistent: active=green, new=blue, paused=yellow,
// error=red, queued/ended=neutral.
const STATUS_COLOR: Record<string, string> = {
    // active / running
    started: "bg-green-500",
    running: "bg-green-500",
    executed: "bg-green-500",
    // new
    created: "bg-blue-500",
    // queued / ended
    pending: "bg-neutral-400",
    exited: "bg-neutral-400",
    // paused / terminated
    stopped: "bg-yellow-500",
    killed: "bg-yellow-500",
    // error
    failed: "bg-red-500",
};

export function statusColor(status: string): string {
    return STATUS_COLOR[status] ?? "bg-neutral-400";
}
