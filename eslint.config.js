import { configs, plugins } from 'eslint-config-airbnb-extended';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'demo/**', '*.config.js', '*.config.ts'],
  },
  plugins.importX,
  plugins.stylistic,
  plugins.typescriptEslint,
  ...configs.base.all,
  {
    rules: {
      // Customizations for this project
      'import-x/extensions': 'off', // TypeScript uses node module resolution without extensions
      'import-x/prefer-default-export': 'off',
      'no-underscore-dangle': 'off', // Using # for private fields
      'no-param-reassign': ['error', { props: false }],
      'no-restricted-syntax': ['error', 'LabeledStatement', 'WithStatement'], // Allow for...of loops
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-restricted-exports': ['error', { restrictedNamedExports: ['then'] }], // Allow 'default'
      '@typescript-eslint/naming-convention': 'off', // Allow flexible naming
      '@stylistic/max-len': ['error', {
        code: 120,
        ignoreComments: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
      }],
    },
  },
];

