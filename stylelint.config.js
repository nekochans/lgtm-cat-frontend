module.exports = {
  extends: ['stylelint-config-standard', 'stylelint-config-recess-order'],
  plugins: ['stylelint-order'],
  ignoreFiles: [
    '**/node_modules/**',
    'src/styles/bundle.css',
    '**/.next/**',
    '**/build/**',
    '**/coverage/**',
  ],
  rules: {
    'string-quotes': 'single',
    'at-rule-no-unknown': [true, { ignoreAtRules: ['tailwind'] }],
  },
};
