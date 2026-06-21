<template>
    <div class="editor relative min-h-full font-mono text-xs leading-relaxed">
        <pre class="pointer-events-none m-0 p-4 wrap-break-word whitespace-pre-wrap" v-html="highlighted" />
        <textarea
            ref="editor-element"
            v-model="model"
            spellcheck="false"
            autocomplete="off"
            class="absolute inset-0 m-0 resize-none overflow-hidden border-0 bg-transparent p-4 wrap-break-word whitespace-pre-wrap text-transparent caret-(--ui-text) outline-none"
            :readonly="props.readonly"
            @keydown.tab.prevent="tab()"
            @keydown.ctrl.s.prevent="save()"
            @keydown.meta.s.prevent="save()"
        />
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
