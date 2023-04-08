const { defineConfig } = require('eslint-define-config');

module.exports = defineConfig({
    root: true,
    extends: [require.resolve('@cloudflare-example/eslint-config-custom')],
    ignorePatterns: ['node_modules', 'dist', 'coverage', 'build', 'vite.config.ts'],
    parserOptions: {
        project: './tsconfig.json',
    },
});
