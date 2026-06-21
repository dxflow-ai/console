<template>
    <div class="editor relative flex min-h-full w-fit min-w-full font-mono text-xs leading-relaxed">
        <div class="sticky left-0 z-10 shrink-0 select-none border-r border-default bg-default p-3">
            <template v-for="line in lineCount" :key="line">
                <div class="font-mono text-right text-muted">{{ line }}</div>
            </template>
        </div>
        <div class="relative flex-1">
            <pre class="pointer-events-none m-0 p-3 whitespace-pre" v-html="highlighted" />
            <textarea
                ref="editor-element"
                v-model="model"
                spellcheck="false"
                autocomplete="off"
                class="absolute inset-0 m-0 resize-none overflow-hidden border-0 bg-transparent p-3 whitespace-pre text-transparent caret-(--ui-text) outline-none"
                :readonly="props.readonly"
                @keydown.tab.prevent="tab()"
                @keydown.ctrl.s.prevent="save()"
                @keydown.meta.s.prevent="save()"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { sleep } from "radash";

const props = defineProps({
    name: {
        type: String,
        required: true,
    },
    readonly: {
        type: Boolean,
        default: false,
    },
});

const model = defineModel<string>({
    default: "",
});

const emit = defineEmits({
    save() {
        return true;
    },
});

const editorElement = useTemplateRef<HTMLTextAreaElement>("editor-element");

const editor = newEditorWrapper();

const grammar = shallowRef<EditorGrammar>(null);

const language = computed(() => {
    return editor.language(props.name);
});

const lineCount = computed(() => {
    const lines = model.value.split("\n");

    return lines.length || 0;
});

const highlighted = computed(() => {
    return editor.highlight(model.value, grammar.value, language.value);
});

function tab() {
    const target = editorElement.value;
    if (!target) {
        return;
    }

    const start = target.selectionStart;
    const end = target.selectionEnd;

    model.value = `${model.value.slice(0, start)}    ${model.value.slice(end)}`;

    sleep(0).then(() => {
        target.selectionStart = start + 4;
        target.selectionEnd = start + 4;
    });
}

function save() {
    emit("save");
}

async function load() {
    grammar.value = await editor.load(language.value);
}

onMounted(() => {
    load();
});
</script>
