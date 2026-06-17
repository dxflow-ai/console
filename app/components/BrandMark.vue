<template>
    <div class="inline-flex [&>svg]:size-full [&_path]:fill-primary">
        <svg v-html="mark" />
    </div>
</template>

<script lang="ts" setup>
import mark from "~/assets/icons/mark.svg?raw";
</script>
