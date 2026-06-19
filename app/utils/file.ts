function fileKey(name: string): string {
    return (name.split(".").pop() ?? name).toLowerCase();
}

const FILE_ICON: Record<string, string> = {
    // specific glyphs
    py: "i-hugeicons:python",
    php: "i-hugeicons:php",
    sql: "i-hugeicons:sql",
    css: "i-hugeicons:css-3",
    scss: "i-hugeicons:css-3",
    sass: "i-hugeicons:css-3",
    less: "i-hugeicons:css-3",
    html: "i-hugeicons:html-5",
    htm: "i-hugeicons:html-5",
    jsx: "i-hugeicons:jsx-01",
    tsx: "i-hugeicons:jsx-01",
    xml: "i-hugeicons:xml-01",
    csv: "i-hugeicons:csv-01",
    tsv: "i-hugeicons:csv-01",
    pdf: "i-hugeicons:pdf-01",
    txt: "i-hugeicons:txt-01",
    // source code (file-code)
    js: "i-hugeicons:file-code",
    mjs: "i-hugeicons:file-code",
    cjs: "i-hugeicons:file-code",
    ts: "i-hugeicons:file-code",
    mts: "i-hugeicons:file-code",
    cts: "i-hugeicons:file-code",
    vue: "i-hugeicons:file-code",
    svelte: "i-hugeicons:file-code",
    astro: "i-hugeicons:file-code",
    go: "i-hugeicons:file-code",
    rs: "i-hugeicons:file-code",
    c: "i-hugeicons:file-code",
    h: "i-hugeicons:file-code",
    cpp: "i-hugeicons:file-code",
    cc: "i-hugeicons:file-code",
    hpp: "i-hugeicons:file-code",
    cs: "i-hugeicons:file-code",
    java: "i-hugeicons:file-code",
    swift: "i-hugeicons:file-code",
    kt: "i-hugeicons:file-code",
    kts: "i-hugeicons:file-code",
    rb: "i-hugeicons:file-code",
    lua: "i-hugeicons:file-code",
    pl: "i-hugeicons:file-code",
    r: "i-hugeicons:file-code",
    jl: "i-hugeicons:file-code",
    m: "i-hugeicons:file-code",
    // notebooks / science docs (document-code)
    ipynb: "i-hugeicons:document-code",
    rmd: "i-hugeicons:document-code",
    // shell scripts (file-script)
    sh: "i-hugeicons:file-script",
    bash: "i-hugeicons:file-script",
    zsh: "i-hugeicons:file-script",
    ps1: "i-hugeicons:file-script",
    bat: "i-hugeicons:file-script",
    cmd: "i-hugeicons:file-script",
    // structured data (file-braces)
    json: "i-hugeicons:file-braces",
    jsonc: "i-hugeicons:file-braces",
    json5: "i-hugeicons:file-braces",
    yaml: "i-hugeicons:file-braces",
    yml: "i-hugeicons:file-braces",
    toml: "i-hugeicons:file-braces",
    // config (file-sliders)
    ini: "i-hugeicons:file-sliders",
    cfg: "i-hugeicons:file-sliders",
    conf: "i-hugeicons:file-sliders",
    env: "i-hugeicons:file-sliders",
    editorconfig: "i-hugeicons:file-sliders",
    tf: "i-hugeicons:file-sliders",
    tfvars: "i-hugeicons:file-sliders",
    // docs / markup (file-02)
    md: "i-hugeicons:file-02",
    mdx: "i-hugeicons:file-02",
    rst: "i-hugeicons:file-02",
    tex: "i-hugeicons:file-02",
    adoc: "i-hugeicons:file-02",
    // tabular spreadsheets (file-spreadsheet)
    xlsx: "i-hugeicons:file-spreadsheet",
    xls: "i-hugeicons:file-spreadsheet",
    ods: "i-hugeicons:file-spreadsheet",
    parquet: "i-hugeicons:file-spreadsheet",
    // databases / scientific binary (file-database)
    sqlite: "i-hugeicons:file-database",
    db: "i-hugeicons:file-database",
    h5: "i-hugeicons:file-database",
    hdf5: "i-hugeicons:file-database",
    nc: "i-hugeicons:file-database",
    npy: "i-hugeicons:file-database",
    npz: "i-hugeicons:file-database",
    mat: "i-hugeicons:file-database",
    // images (file-image)
    png: "i-hugeicons:file-image",
    jpg: "i-hugeicons:file-image",
    jpeg: "i-hugeicons:file-image",
    gif: "i-hugeicons:file-image",
    webp: "i-hugeicons:file-image",
    svg: "i-hugeicons:file-image",
    ico: "i-hugeicons:file-image",
    bmp: "i-hugeicons:file-image",
    tiff: "i-hugeicons:file-image",
    // video (file-video)
    mp4: "i-hugeicons:file-video",
    webm: "i-hugeicons:file-video",
    mov: "i-hugeicons:file-video",
    avi: "i-hugeicons:file-video",
    mkv: "i-hugeicons:file-video",
    // audio (file-audio)
    mp3: "i-hugeicons:file-audio",
    wav: "i-hugeicons:file-audio",
    flac: "i-hugeicons:file-audio",
    ogg: "i-hugeicons:file-audio",
    m4a: "i-hugeicons:file-audio",
    // archives (file-zip)
    zip: "i-hugeicons:file-zip",
    tar: "i-hugeicons:file-zip",
    gz: "i-hugeicons:file-zip",
    tgz: "i-hugeicons:file-zip",
    bz2: "i-hugeicons:file-zip",
    xz: "i-hugeicons:file-zip",
    "7z": "i-hugeicons:file-zip",
    rar: "i-hugeicons:file-zip",
    // extension-less / special filenames
    dockerfile: "i-hugeicons:file-code",
    makefile: "i-hugeicons:file-script",
    gitignore: "i-hugeicons:file-02",
    gitattributes: "i-hugeicons:file-02",
};

const FILE_ICON_FALLBACK = "i-hugeicons:file-01";

export function fileIcon(name: string): string {
    return FILE_ICON[fileKey(name)] ?? FILE_ICON_FALLBACK;
}

const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif", "webp", "svg", "ico", "bmp", "tiff"]);

const TEXT_EXTENSIONS = new Set([
    // source code
    "js",
    "mjs",
    "cjs",
    "ts",
    "mts",
    "cts",
    "tsx",
    "jsx",
    "vue",
    "svelte",
    "astro",
    "go",
    "rs",
    "c",
    "h",
    "cpp",
    "cc",
    "hpp",
    "cs",
    "java",
    "swift",
    "kt",
    "kts",
    "rb",
    "php",
    "lua",
    "pl",
    "r",
    "jl",
    "m",
    "py",
    "scala",
    "clj",
    "cljs",
    "ex",
    "exs",
    "erl",
    "hs",
    "elm",
    "dart",
    "nim",
    "zig",
    "v",
    "sol",
    "tcl",
    "hx",
    "ml",
    "mli",
    "rkt",
    "scm",
    "lisp",
    "cl",
    "ada",
    "pas",
    "groovy",
    // shell
    "sh",
    "bash",
    "zsh",
    "ps1",
    "bat",
    "cmd",
    // markup / styles
    "html",
    "htm",
    "css",
    "scss",
    "sass",
    "less",
    "xml",
    "svg",
    // data / config
    "json",
    "jsonc",
    "json5",
    "yaml",
    "yml",
    "toml",
    "ini",
    "cfg",
    "conf",
    "env",
    "editorconfig",
    "csv",
    "tsv",
    "graphql",
    "gql",
    "prisma",
    "sql",
    "tf",
    "tfvars",
    // docs
    "md",
    "mdx",
    "rst",
    "tex",
    "adoc",
    "txt",
    "log",
    "ipynb",
    "rmd",
    "diff",
    "patch",
    // bare filenames
    "dockerfile",
    "makefile",
    "gitignore",
    "gitattributes",
    "license",
    "readme",
]);

export function isImageFile(name: string): boolean {
    return IMAGE_EXTENSIONS.has(fileKey(name));
}

export function isTextFile(name: string): boolean {
    return TEXT_EXTENSIONS.has(fileKey(name));
}

export function isOpenableFile(name: string): boolean {
    return isImageFile(name) || isTextFile(name);
}

export function parentOf(identity: string): string {
    const path = identity.split("/").slice(0, -1).join("/");
    if (path) {
        return path;
    }

    return ".";
}

export function uniqueName(names: string[], base: string): string {
    const taken = new Set(names);

    if (!taken.has(base)) {
        return base;
    }

    let index = 2;
    while (taken.has(`${base}-${index}`)) {
        index++;
    }

    return `${base}-${index}`;
}
