// eslint-disable-next-line import/no-unresolved
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    exclude: [...configDefaults.exclude, 'tests/browser/**'],
  },
});
