import { Marked } from "marked";

class MarkdownWrapper {
    marked: Marked;

    constructor() {
        const editor = newEditorWrapper();

        this.marked = new Marked({
            async: false,
            breaks: true,
            gfm: true,
            renderer: {
                code({ text, lang }) {
                    const language = editor.language(lang ?? "");
                    const grammar = editor.grammar(language);
                    const highlighted = editor.highlight(text, grammar, language).replace(/\n+$/, "");
                    const className = language ? `language-${language}` : "language-none";

                    return `<pre class="editor"><code class="${className}">${highlighted}</code></pre>`;
                },
            },
        });
    }

    render(content: string): string {
        return this.marked.parse(content) as string;
    }
}

export function newMarkdownWrapper() {
    const markdownWrapper = new MarkdownWrapper();

    return markdownWrapper;
}
