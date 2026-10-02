import dts from 'rollup-plugin-dts';

/** @type {import('rollup').RollupOptions} */
const config = {
  input: 'dist/types/index.d.ts',
  output: [
    { file: 'dist/index.d.ts', format: 'es' },
    { file: 'dist/index.d.cts', format: 'es' },
  ],
  plugins: [dts()],
};

export default config;
