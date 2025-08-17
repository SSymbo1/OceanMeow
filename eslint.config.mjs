import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import vue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        __PROJECT_NAME__: 'readonly',
        __PROJECT_VERSION__: 'readonly',
        __DEPENDENCIES__: 'readonly',
      },
    },
  },
  ...vue.configs['flat/recommended'],
  {
    name: 'renderer_process',
    files: ['src/renderer/**/*.{ts,vue}'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 'latest',
      },
      globals: { ...globals.browser },
    },
    plugins: { prettier },
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
  },
  {
    name: 'main_process',
    files: ['src/main/**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      sourceType: 'script',
      globals: { ...globals.node },
    },
    plugins: { prettier },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  prettierConfig,
  {
    ignores: ['**/*.d.ts', 'dist/**', 'dist-electron/**', 'node_modules/**'],
  }
);
