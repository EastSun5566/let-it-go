import { nodeResolve } from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

import pkg from './package.json';

const extensions = ['.js', '.ts'];

export default {
  input: 'src/index.ts',
  output: {
    name: pkg.name,
    file: pkg.main,
    format: 'umd',
  },
  plugins: [
    nodeResolve({ extensions }),
    babel({
      extensions,
      include: 'src/**/*',
      babelHelpers: 'bundled',
    }),
    terser(),
  ],
};
