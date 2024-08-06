import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import jsxA11Y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: [
      '**/node_modules/',
      '**/.next/',
      '**/build/',
      '**/coverage/',
      '**/.eslintrc.json',
      '**/next-env.d.ts',
      'test/setupTests.ts',
      '**/*.config.js',
      '**/*.config.mjs',
      '**/__mocks__',
      '**/storybook-static/',
      'public/mockServiceWorker.js',
      '**/*.module.css.d.ts',
      '**/*.module.css.d.ts.map',
      '**/vitest.config.mts',
      '**/vitest.setup.mts',
    ],
  },
  ...fixupConfigRules(
    compat.extends(
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:@typescript-eslint/recommended-requiring-type-checking',
      'standard-with-typescript',
      'plugin:jsx-a11y/recommended',
      'plugin:react/recommended',
      'plugin:react/jsx-runtime',
      'plugin:react-hooks/recommended',
      'plugin:vitest/recommended',
      'plugin:storybook/recommended',
      'next/core-web-vitals',
      'prettier',
    ),
  ),
  {
    plugins: {
      '@typescript-eslint': fixupPluginRules(typescriptEslint),
      'jsx-a11y': fixupPluginRules(jsxA11Y),
      react: fixupPluginRules(react),
      'react-hooks': fixupPluginRules(reactHooks),
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },

      ecmaVersion: 'latest',
      sourceType: 'module',

      parserOptions: {
        tsconfigRootDir: '.',
        project: ['./tsconfig.json', './tsconfig.storybook.json'],
      },
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    rules: {
      'padding-line-between-statements': [
        'error',
        {
          blankLine: 'always',
          prev: '*',
          next: 'return',
        },
      ],

      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': ['error'],

      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: false,
        },
      ],

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        {
          allowNullableObject: true,
        },
      ],

      '@typescript-eslint/triple-slash-reference': [
        'error',
        {
          types: 'always',
        },
      ],

      'import/extensions': [
        'error',
        {
          ignorePackages: true,

          pattern: {
            js: 'never',
            jsx: 'never',
            ts: 'never',
            tsx: 'never',
          },
        },
      ],

      'react/display-name': 'off',
    },
  },
  {
    files: ['**/*.tsx'],

    rules: {
      'react/prop-types': 'off',
    },
  },
];
