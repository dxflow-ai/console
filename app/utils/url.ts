export const THEME_PARAMETER = "theme";
export const TOKEN_PARAMETER = "token";

export function readUrlParameter(name: string): string {
    const url = new URL(window.location.href);

    const hash = new URLSearchParams(url.hash.replace(/^#/, ""));

    return hash.get(name) || url.searchParams.get(name) || "";
}

export function dropUrlParameter(...names: string[]): boolean {
    const url = new URL(window.location.href);

    const hash = new URLSearchParams(url.hash.replace(/^#/, ""));

    const dropped = names.filter((name) => {
        return hash.has(name) || url.searchParams.has(name);
    });

    if (!dropped.length) {
        return false;
    }

    for (const name of dropped) {
        hash.delete(name);
        url.searchParams.delete(name);
    }

    const remaining = hash.toString();
    url.hash = remaining ? `#${remaining}` : "";

    window.history.replaceState(window.history.state, "", url.toString());

    return true;
}
