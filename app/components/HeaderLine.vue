<template>
    <div class="flex flex-col gap-4 mb-4">
        <div class="flex items-center justify-between gap-8">
            <div
                class="flex flex-1 items-center gap-1.5 flex-wrap animate-fade-right animate-duration-200 animate-delay-700"
            >
                <slot name="tags" />
            </div>
            <div class="flex items-center gap-1.5 animate-fade-left animate-duration-200 animate-delay-600">
                <slot name="actions" />
            </div>
        </div>
        <div class="flex items-center justify-between gap-8">
            <div class="flex items-center gap-1.5 animate-fade-right animate-duration-200 animate-delay-600">
                <slot name="title" />
            </div>
            <div class="flex items-center gap-1.5 animate-fade-left animate-duration-200 animate-delay-700">
                <slot name="options" />
            </div>
        </div>
    </div>
</template>
