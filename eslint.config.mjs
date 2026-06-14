import diphyx from "@diphyx/eslint-plugin";

export default [
    // Global ignores
    {
        ignores: ["node_modules/**", ".nuxt/**", ".output/**", "dist/**", "**/*.d.ts"],
    },

    // DiPhyx shared config (parsers, Vue rules, and all custom rules)
    ...diphyx.configs.recommended,
];
