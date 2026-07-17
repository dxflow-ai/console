<template>
    <div class="flex flex-col gap-2 p-3">
        <template v-for="message in messages" :key="message.id">
            <div
                class="flex flex-col items-stretch gap-1.5 select-text"
                :class="{
                    'items-end!': message.role === 'user',
                }"
            >
                <template v-if="message.role === 'user'">
                    <div
                        class="max-w-[85%] rounded-lg rounded-br-sm bg-primary/10 my-2 px-3 py-1.5 text-xs whitespace-pre-wrap text-primary"
                    >
                        <span>{{ message.content }}</span>
                    </div>
                </template>
                <template v-else-if="message.content">
                    <div class="markdown" v-html="render(message.content)" />
                </template>
            </div>
        </template>
        <div ref="anchor-element" />
    </div>
</template>

<script lang="ts" setup>
const { messages } = useAgent();

const anchorElement = useTemplateRef<HTMLDivElement>("anchor-element");

watch(
    () => {
        const last = messages.value[messages.value.length - 1];

        return `${messages.value.length}:${last?.content.length ?? 0}`;
    },
    async () => {
        await nextTick();

        anchorElement.value?.scrollIntoView({
            block: "end",
        });
    },
);

const markdown = newMarkdownWrapper();

function render(content: string) {
    return markdown.render(content);
}
</script>
