import Prism from "prismjs";

import "prismjs/components/prism-json";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-toml";
import "prismjs/components/prism-ini";
import "prismjs/components/prism-properties";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-python";
import "prismjs/components/prism-sql";

export type EditorGrammar = Prism.Grammar | null;

const languages: Record<string, string> = {
    // web / scripting
    js: "javascript",
    mjs: "javascript",
    cjs: "javascript",
    jsx: "jsx",
    ts: "typescript",
    mts: "typescript",
    cts: "typescript",
    tsx: "tsx",
    coffee: "coffeescript",
    // markup / styles
    html: "markup",
    htm: "markup",
    xml: "markup",
    svg: "markup",
    vue: "markup",
    svelte: "markup",
    astro: "markup",
    css: "css",
    scss: "scss",
    sass: "sass",
    less: "less",
    // systems / compiled
    go: "go",
    rs: "rust",
    c: "c",
    h: "c",
    cpp: "cpp",
    cc: "cpp",
    cxx: "cpp",
    hpp: "cpp",
    cs: "csharp",
    java: "java",
    scala: "scala",
    kt: "kotlin",
    kts: "kotlin",
    swift: "swift",
    dart: "dart",
    zig: "clike",
    mm: "objectivec",
    // dynamic / functional
    rb: "ruby",
    php: "php",
    pl: "perl",
    pm: "perl",
    lua: "lua",
    hs: "haskell",
    ex: "elixir",
    exs: "elixir",
    erl: "erlang",
    clj: "clojure",
    cljs: "clojure",
    groovy: "groovy",
    // shells / config
    sh: "bash",
    bash: "bash",
    zsh: "bash",
    ps1: "powershell",
    yaml: "yaml",
    yml: "yaml",
    toml: "toml",
    ini: "ini",
    cfg: "ini",
    conf: "ini",
    env: "ini",
    editorconfig: "ini",
    properties: "properties",
    dockerfile: "docker",
    makefile: "makefile",
    tf: "hcl",
    tfvars: "hcl",
    // data / query
    json: "json",
    jsonc: "json",
    json5: "json5",
    sql: "sql",
    graphql: "graphql",
    gql: "graphql",
    // data science / scientific
    py: "python",
    r: "r",
    jl: "julia",
    m: "matlab",
    tex: "latex",
    ipynb: "json",
    // docs
    md: "markdown",
    mdx: "markdown",
    rmd: "markdown",
};

const loaders: Record<string, () => Promise<unknown>> = {
    async typescript() {
        await import("prismjs/components/prism-typescript");
    },
    async jsx() {
        await import("prismjs/components/prism-jsx");
    },
    async tsx() {
        await import("prismjs/components/prism-jsx");
        await import("prismjs/components/prism-typescript");
        await import("prismjs/components/prism-tsx");
    },
    async coffeescript() {
        await import("prismjs/components/prism-coffeescript");
    },
    async scss() {
        await import("prismjs/components/prism-scss");
    },
    async sass() {
        await import("prismjs/components/prism-sass");
    },
    async less() {
        await import("prismjs/components/prism-less");
    },
    async go() {
        await import("prismjs/components/prism-go");
    },
    async rust() {
        await import("prismjs/components/prism-rust");
    },
    async c() {
        await import("prismjs/components/prism-c");
    },
    async cpp() {
        await import("prismjs/components/prism-c");
        await import("prismjs/components/prism-cpp");
    },
    async objectivec() {
        await import("prismjs/components/prism-c");
        await import("prismjs/components/prism-objectivec");
    },
    async csharp() {
        await import("prismjs/components/prism-csharp");
    },
    async java() {
        await import("prismjs/components/prism-java");
    },
    async scala() {
        await import("prismjs/components/prism-java");
        await import("prismjs/components/prism-scala");
    },
    async kotlin() {
        await import("prismjs/components/prism-kotlin");
    },
    async swift() {
        await import("prismjs/components/prism-swift");
    },
    async dart() {
        await import("prismjs/components/prism-dart");
    },
    async ruby() {
        await import("prismjs/components/prism-ruby");
    },
    async php() {
        await import("prismjs/components/prism-markup-templating");
        await import("prismjs/components/prism-php");
    },
    async perl() {
        await import("prismjs/components/prism-perl");
    },
    async lua() {
        await import("prismjs/components/prism-lua");
    },
    async haskell() {
        await import("prismjs/components/prism-haskell");
    },
    async elixir() {
        await import("prismjs/components/prism-elixir");
    },
    async erlang() {
        await import("prismjs/components/prism-erlang");
    },
    async clojure() {
        await import("prismjs/components/prism-clojure");
    },
    async groovy() {
        await import("prismjs/components/prism-groovy");
    },
    async powershell() {
        await import("prismjs/components/prism-powershell");
    },
    async docker() {
        await import("prismjs/components/prism-docker");
    },
    async makefile() {
        await import("prismjs/components/prism-makefile");
    },
    async hcl() {
        await import("prismjs/components/prism-hcl");
    },
    async json5() {
        await import("prismjs/components/prism-json5");
    },
    async graphql() {
        await import("prismjs/components/prism-graphql");
    },
    async r() {
        await import("prismjs/components/prism-r");
    },
    async julia() {
        await import("prismjs/components/prism-julia");
    },
    async matlab() {
        await import("prismjs/components/prism-matlab");
    },
    async latex() {
        await import("prismjs/components/prism-latex");
    },
};

function escapeHtml(value: string): string {
    return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

class EditorWrapper {
    language(name: string): string {
        const extension = (name.split(".").pop() ?? name).toLowerCase();

        return languages[extension] ?? "";
    }

    grammar(language: string): EditorGrammar {
        return language ? (Prism.languages[language] ?? null) : null;
    }

    async load(language: string): Promise<EditorGrammar> {
        const loader = loaders[language];
        if (loader) {
            await loader();
        }

        return this.grammar(language);
    }

    highlight(source: string, grammar: EditorGrammar, language: string): string {
        const code = `${source}\n`;

        if (grammar) {
            return Prism.highlight(code, grammar, language);
        }

        return escapeHtml(code);
    }
}

export function newEditorWrapper() {
    const editorWrapper = new EditorWrapper();

    return editorWrapper;
}
