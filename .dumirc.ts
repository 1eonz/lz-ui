import { defineConfig } from 'dumi';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Dumi 只负责文档站，不参与组件包的运行时逻辑。
 * 将文档构建和 library build 分开，可以避免 demo 依赖进入 npm 产物。
 */
export default defineConfig({
  title: 'lx-ui',
  outputPath: 'docs-dist',
  hash: true,
  // Keep third-party Dumi shell adjustments outside the published library CSS.
  styles: [{ content: readFileSync(resolve(process.cwd(), 'docs/docs-shell.css'), 'utf8') }],
  // Dumi 开发服务器要求绝对根路径；静态部署再切换成相对路径。
  publicPath: isProduction ? './' : '/',
  ...(isProduction ? { runtimePublicPath: {} } : {}),
  locales: [
    { id: 'zh-CN', name: '中文' },
    { id: 'en-US', name: 'English' },
  ],
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { title: '文档首页', link: '/docs' },
      { title: '项目架构', link: '/architecture' },
      { title: '开发规范', link: '/project-rules' },
      { title: 'UI 设计门禁', link: '/ui-design-gate' },
    ],
    prefersColor: {
      default: 'light',
      switch: true,
    },
  },
  resolve: {
    docDirs: ['docs', 'src'],
    // Most snippets explain API shape; explicit <code src> demos above them run live.
    codeBlockMode: 'passive',
  },
});
