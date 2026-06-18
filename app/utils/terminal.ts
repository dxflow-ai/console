import { load } from "webfontloader";
import { sleep } from "radash";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebglAddon } from "@xterm/addon-webgl";

import type { ITheme, ITerminalOptions } from "@xterm/xterm";

const lightTheme: ITheme = {
    foreground: "#0f172a",
    background: "#ffffff00",
    cursor: "#0f172a",
    cursorAccent: "#ffffff",
    black: "#1e293b",
    red: "#dc2626",
    green: "#16a34a",
    yellow: "#ca8a04",
    blue: "#2563eb",
    magenta: "#9333ea",
    cyan: "#0891b2",
    white: "#cbd5e1",
    brightBlack: "#475569",
    brightRed: "#ef4444",
    brightGreen: "#22c55e",
    brightYellow: "#eab308",
    brightBlue: "#3b82f6",
    brightMagenta: "#a855f7",
    brightCyan: "#06b6d4",
    brightWhite: "#f1f5f9",
};

const darkTheme: ITheme = {
    foreground: "#e2e8f0",
    background: "#00000000",
    cursor: "#e2e8f0",
    cursorAccent: "#0f172a",
    black: "#1e293b",
    red: "#dc2626",
    green: "#16a34a",
    yellow: "#ca8a04",
    blue: "#2563eb",
    magenta: "#9333ea",
    cyan: "#0891b2",
    white: "#cbd5e1",
    brightBlack: "#475569",
    brightRed: "#ef4444",
    brightGreen: "#22c55e",
    brightYellow: "#eab308",
    brightBlue: "#3b82f6",
    brightMagenta: "#a855f7",
    brightCyan: "#06b6d4",
    brightWhite: "#f1f5f9",
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
    lineHeight: 1.35,
    cursorBlink: true,
    allowTransparency: true,
    cursorStyle: "block",
    logLevel: "off",
};

type TerminalWrapperCallback = {
    onData?: (value: string) => void;
    onResize?: (columns: number, rows: number) => void;
};

export function newTerminalWrapper() {
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
                    custom: { families: [primaryFont] },
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
            this.options.lineHeight = config.lineHeight * scale;
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

    const terminalWrapper = new TerminalWrapper();

    return terminalWrapper;
}
