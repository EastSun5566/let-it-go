import { configs, plugins } from 'eslint-config-airbnb-extended';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.js', '*.config.ts'],
  },
  plugins.importX,
  plugins.stylistic,
  plugins.typescriptEslint,
  ...configs.base.all,
  {
    rules: {
      // Customizations for demo
      'import-x/extensions': 'off',
      'import-x/prefer-default-export': 'off',
      'no-console': 'off', // Allow console in demo
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/semi': 'off', // Allow missing semicolons
      '@stylistic/semi': 'off', // Allow missing semicolons
      '@stylistic/member-delimiter-style': 'off', // Allow flexible interface member delimiters
      '@stylistic/max-len': ['error', {
        code: 120,
        ignoreComments: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
      }],
    },
  },
];
