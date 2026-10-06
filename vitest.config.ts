import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

/**
 * 测试环境先建立好，但当前阶段不写组件测试。
 * jsdom 用于模拟浏览器 DOM；真实浏览器差异和视觉回归会在 UI 设计确认后加入 Playwright。
 */
export default defineConfig({
  resolve: {
    alias: {
      'dumi/theme/slots': resolve(process.cwd(), 'node_modules/dumi/theme-default/slots'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './coverage',
    },
  },
});
