import { defineConfig } from 'father';
import path from 'node:path';

/**
 * Father 以 src/ 为构建输入，会逐文件发出 ESM/CJS 和声明文件。
 * 公开 API 由 package exports 与 src/index.ts 限定；演示源码必须放
 * docs/demos/，否则即使未从入口导出，也会被发进 npm 产物并增加包体。
 */
export default defineConfig({
  esm: {
    input: 'src',
    output: 'dist/esm',
    autoExtension: true,
    transformer: 'babel',
    extraBabelPlugins: [
      [path.resolve('scripts/babel-plugin-stable-css-modules.cjs'), { format: 'esm' }],
    ],
    dts: {
      compiler: 'tsc',
    },
  },
  cjs: {
    input: 'src',
    output: 'dist/cjs',
    autoExtension: true,
    transformer: 'babel',
    extraBabelPlugins: [
      [path.resolve('scripts/babel-plugin-stable-css-modules.cjs'), { format: 'cjs' }],
    ],
    dts: {
      compiler: 'tsc',
    },
  },
});
