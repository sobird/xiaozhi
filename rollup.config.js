/* eslint-disable @typescript-eslint/naming-convention */
/**
 * rollup.config.js
 * 打包压缩ts文件
 *
 * @type {import('rollup').RollupOptions}
 * @see https://cn.rollupjs.org/configuration-options
 * sobird<i@sobird.me> at 2023/09/28 11:30:37 created.
 */
import { dirname, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import { glob } from 'glob';
import { defineConfig } from 'rollup';
import clear from 'rollup-plugin-clear';
import copy from 'rollup-plugin-copy';
import external from 'rollup-plugin-peer-deps-external';
import typescript from 'rollup-plugin-typescript2';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const DIST = isProduction ? 'dist' : 'dist';

function input(pattern) {
  return glob.sync(pattern, {
    ignore: ['src/**/*.d.ts'],
    cwd: __dirname,
    absolute: false,
  }).reduce((accu, filename) => {
    accu[relative(
      'src',
      filename.slice(0, filename.length - extname(filename).length),
    )] = filename;
    return accu;
  }, {});
}

const mainInput = input(['index.ts']);

export default (env) => {
  return defineConfig([
    // { // es module
    //   input: mainInput,
    //   output: {
    //     //preserveModules: true,
    //     dir: `${DIST}/es`,
    //     format: "es",
    //   },
    //   plugins: plugins({
    //     clear: {
    //       targets: [`${DIST}/es`],
    //     },
    //   }, env),
    // },

    { // es module
      input: 'index.ts',
      output: {
        dir: `${DIST}`,
        format: 'es',
        // entryFileNames: '[name].cjs',
        // exports: 'named',
        // footer: ({exports}) => exports.length > 0 ? 'module.exports = Object.assign(exports.default || {}, exports)' : '',
      },
      plugins: [
        clear({
          targets: [DIST],
          watch: false,
        }),
        external({
          includeDependencies: true,
        }),
        nodeResolve({
          preferBuiltins: true,
        }),
        commonjs(),
        typescript({
          check: false,
          // declaration: true,
          // tsconfig: "./src/tsconfig.json",
          // noEmitOnError: false,
          strictRequires: true,
        }),
        json(),
        terser(),
        copy({
          targets: [
            { src: 'package.json', dest: DIST },
            { src: 'README.md', dest: DIST },
            { src: 'LICENSE', dest: DIST },
          ],
          copyOnce: env.watch,
        }),
      ],
    },
  ]);
};
