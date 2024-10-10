import antfu from '@antfu/eslint-config';
import tailwindcss from 'eslint-plugin-tailwindcss';

export default antfu(
  {
    react: true,
    formatters: {
      css: true,
      html: true,
      markdown: 'prettier',
    },
    stylistic: {
      semi: true,
      overrides: {
        'semi': ['error', 'always'],
        'semi-spacing': ['error', { after: true, before: false }],
        'semi-style': ['error', 'last'],
        'no-extra-semi': 'error',
        'no-unexpected-multiline': 'error',
        'no-unreachable': 'error',
      },
    },
    typescript: {
      overrides: {
        'ts/consistent-type-definitions': ['error', 'type'],
      },
    },
    ignores: [
      '**/node_modules/',
      '**/.next/',
      '**/build/',
      '**/coverage/',
      '**/.eslintrc.json',
      '**/next-env.d.ts',
      '**/*.config.js',
      '**/storybook-static/',
      'public/mockServiceWorker.js',
      '**/vitest.config.mts',
      '**/vitest.setup.mts',
      'next.config.mjs',
    ],
  },
  {
    rules: {
      'node/prefer-global/process': 'off',
    },
  },
  ...tailwindcss.configs['flat/recommended'],
);
