module.exports = {
  extends: ['stylelint-config-smarthr', 'stylelint-config-recess-order'],
  ignoreFiles: [
    '**/node_modules/**',
    '**/.next/**',
    '**/build/**',
    '**/coverage/**',
  ],
  rules: {
    'function-whitespace-after': null,
  },
};
