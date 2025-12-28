import tseslint from 'typescript-eslint';
import airbnbExtended from 'eslint-config-airbnb-extended';

const { configs, plugins } = airbnbExtended;

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'demo/**', '*.config.js', '*.config.ts'],
  },
  ...configs.base.typescript,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts', 'src/**/*.js'],
    plugins: {
      '@stylistic': plugins.stylistic,
      'import-x': plugins.importX,
      'n': plugins.node,
    },
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      // Customizations for TypeScript
      'import/extensions': 'off',
      'import-x/extensions': 'off',
    },
  },
);

