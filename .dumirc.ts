import { defineConfig } from 'dumi';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Dumi 只负责文档站，不参与组件包的运行时逻辑。
 * 将文档构建和 library build 分开，可以避免 demo 依赖进入 npm 产物。
 */
export default defineConfig({
  title: 'lx-ui',
  favicons: ['/logo.svg'],
  outputPath: 'docs-dist',
  hash: true,
  // 第三方 Dumi 文档壳调整不进入发布的组件库 CSS。
  styles: [{ content: readFileSync(resolve(process.cwd(), 'docs/docs-shell.css'), 'utf8') }],
  // 静态文档按根路径部署，确保深路由的异步 chunk 使用根资源前缀。
  base: '/',
  publicPath: '/',
  // Dumi 默认视口会禁止用户缩放；统一由本地插件改成允许放大的声明。
  plugins: [resolve(process.cwd(), 'docs/plugins/accessible-viewport.ts')],
  // 仅公开已有完整文档路由的语言，避免语言切换跳转到未翻译页面。
  locales: [{ id: 'zh-CN', name: '中文' }],
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
    // 多数代码块解释 API 形态；上方显式 <code src> 示例才在页面实际运行。
    codeBlockMode: 'passive',
  },
});
