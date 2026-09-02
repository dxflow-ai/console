export function readUrlParameter(name: string): string {
    const url = new URL(window.location.href);

    const hash = new URLSearchParams(url.hash.replace(/^#/, ""));

    return hash.get(name) || url.searchParams.get(name) || "";
}

export function dropUrlParameter(name: string) {
    const url = new URL(window.location.href);

    const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
    if (!hash.has(name) && !url.searchParams.has(name)) {
        return;
    }

    hash.delete(name);
    url.searchParams.delete(name);

    const remaining = hash.toString();
    url.hash = remaining ? `#${remaining}` : "";

    window.history.replaceState(window.history.state, "", url.toString());
}

export function takeUrlParameter(name: string): string {
    const value = readUrlParameter(name);
    if (value) {
        dropUrlParameter(name);
    }

    return value;
}
