/* eslint-env node */
const { FlatCompat } = require('@eslint/eslintrc')
const js = require('@eslint/js')
const vuePlugin = require('eslint-plugin-vue')
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
})

module.exports = [
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.js', '*.config.cjs', 'postcss.config.js', 'tailwind.config.js'],
  },
  ...compat.extends(
    'plugin:vue/vue3-essential',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ),
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-require-imports': 'off',
      'prettier/prettier': 'error',
    },
    plugins: {
      prettier: require('eslint-plugin-prettier'),
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: require('vue-eslint-parser'),
      ecmaVersion: 2020,
      sourceType: 'module',
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'prettier/prettier': 'error',
    },
    plugins: {
      vue: vuePlugin,
      prettier: require('eslint-plugin-prettier'),
    },
  },
]

