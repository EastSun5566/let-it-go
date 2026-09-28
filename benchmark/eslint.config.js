import baseConfig from '../eslint.config.js';

export default [
  ...baseConfig,
  {
    files: ['benchmark/src/**/*.ts', 'benchmark/tests/**/*.ts', 'benchmark/scripts/**/*.mjs'],
    rules: {
      'class-methods-use-this': 'off',
      'max-classes-per-file': 'off',
      'no-await-in-loop': 'off',
      'no-bitwise': 'off',
      'no-continue': 'off',
      'no-restricted-globals': 'off',
    },
  },
];
