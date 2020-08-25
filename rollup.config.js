import { nodeResolve } from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

import { name, main } from './package.json';

const extensions = ['.js', '.ts'];

export default {
  input: 'src/index.ts',
  output: {
    name,
    file: main,
    format: 'umd',
  },
  plugins: [
    nodeResolve({ extensions }),
    babel({
      extensions,
      presets: ['@babel/env', '@babel/typescript'],
      plugins: ['@babel/proposal-class-properties'],
      babelHelpers: 'bundled',
    }),
    terser(),
  ],
};
