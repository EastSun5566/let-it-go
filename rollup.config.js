import { DEFAULT_EXTENSIONS } from '@babel/core';
import { nodeResolve, DEFAULTS } from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import filesize from 'rollup-plugin-filesize';

import pkg from './package.json' with { type: 'json' };

const { name, main, module } = pkg;

/**
 * @param {string} string
 */
const camalize = (string) => string
  .toLowerCase()
  .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase());

/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
  input: 'src/index.ts',
  output: [
    {
      name: camalize(name),
      file: main,
      format: 'umd',
      // sourcemap: true,
      exports: 'named',
    },
    {
      file: module,
      format: 'es',
      // sourcemap: true,
    },
  ],
  plugins: [
    nodeResolve({ extensions: [...DEFAULTS.extensions, '.ts'] }),
    babel({
      extensions: [...DEFAULT_EXTENSIONS, '.ts'],
      presets: ['@babel/env', '@babel/typescript'],
      plugins: ['@babel/proposal-class-properties'],
      babelHelpers: 'bundled',
    }),
    terser(),
    filesize(),
  ],
};

export default config;
