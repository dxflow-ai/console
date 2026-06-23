import { load } from "webfontloader";
import { sleep } from "radash";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebglAddon } from "@xterm/addon-webgl";

import type { ITheme, ITerminalOptions } from "@xterm/xterm";

const lightTheme: ITheme = {
    foreground: "#18181b",
    background: "#ffffff00",
    cursor: "#18181b",
    cursorAccent: "#ffffff",
    black: "#27272a",
    red: "#dc2626",
    green: "#16a34a",
    yellow: "#ca8a04",
    blue: "#2563eb",
    magenta: "#7c3aed",
    cyan: "#0891b2",
    white: "#d4d4d8",
    brightBlack: "#52525b",
    brightRed: "#ef4444",
    brightGreen: "#22c55e",
    brightYellow: "#eab308",
    brightBlue: "#3b82f6",
    brightMagenta: "#8b5cf6",
    brightCyan: "#06b6d4",
    brightWhite: "#f4f4f5",
};

const darkTheme: ITheme = {
    foreground: "#e4e4e7",
    background: "#00000000",
    cursor: "#e4e4e7",
    cursorAccent: "#18181b",
    black: "#27272a",
    red: "#f87171",
    green: "#4ade80",
    yellow: "#facc15",
    blue: "#60a5fa",
    magenta: "#a78bfa",
    cyan: "#22d3ee",
    white: "#d4d4d8",
    brightBlack: "#71717a",
    brightRed: "#fca5a5",
    brightGreen: "#86efac",
    brightYellow: "#fde047",
    brightBlue: "#93c5fd",
    brightMagenta: "#c4b5fd",
    brightCyan: "#67e8f9",
    brightWhite: "#f4f4f5",
};

const themes: Record<string, ITheme> = {
    light: lightTheme,
    dark: darkTheme,
};

const primaryFont = "Inconsolata";

const fallbackFonts =
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";

const config: ITerminalOptions = {
    theme: lightTheme,
    fontFamily: `"${primaryFont}", ${fallbackFonts}`,
    fontSize: 14,
    fontWeight: 400,
    fontWeightBold: 700,
    lineHeight: 1.1,
    cursorBlink: true,
    allowTransparency: true,
    cursorStyle: "block",
    logLevel: "off",
};

type TerminalWrapperCallback = {
    onData?: (value: string) => void;
    onResize?: (columns: number, rows: number) => void;
};

class TerminalWrapper extends Terminal {
    fitAddon: FitAddon;
    webglAddon: WebglAddon;

    constructor() {
        super({ cols: 1, rows: 1, ...config });

        this.fitAddon = new FitAddon();
        this.webglAddon = new WebglAddon();

        this.loadAddon(this.fitAddon);
    }

    async attach({ element, onData, onResize }: { element: HTMLElement } & TerminalWrapperCallback) {
        await sleep(250);
        this.open(element);
        this.loadAddon(this.webglAddon);

        this.onData((data) => {
            if (onData) {
                onData(data);
            }
        });

        this.onResize((size) => {
            if (onResize) {
                onResize(size.cols, size.rows);
            }
        });

        await new Promise<void>((resolve) => {
            load({
                custom: {
                    families: [primaryFont],
                },
                active: resolve,
                inactive: resolve,
            });
        });

        this.webglAddon.clearTextureAtlas();

        await sleep(500);
        this.fitAddon.fit();
    }

    setScale(scale: number) {
        this.options.fontSize = config.fontSize * scale;
    }

    setTheme(theme: string) {
        if (themes[theme]) {
            this.options.theme = themes[theme];
        }
    }

    tryWrite(data: string): MaybeError {
        try {
            this.write(data);

            return null;
        } catch (error: any) {
            return new Error(error?.message || error);
        }
    }
}

export function newTerminalWrapper() {
    const terminalWrapper = new TerminalWrapper();

    return terminalWrapper;
}
