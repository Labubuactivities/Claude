module.exports = {
    root: true,
    extends: ["expo", "plugin:@typescript-eslint/recommended"],
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    ignorePatterns: ["node_modules/", "dist/", ".expo/", "services/ingest/data/"],
    rules: {
        "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
        "@typescript-eslint/no-explicit-any": "warn",
    },
};
