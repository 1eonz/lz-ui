# 测试策略

测试验证公开行为和用户路径，不追求把实现细节全部锁死。这样组件内部可以优化，用户能依赖的行为仍然稳定。

## 1. 测试层级

### 单元测试

验证 token 计算、格式化、列配置、键盘工具和纯函数。纯函数尽量不依赖 DOM，执行快且容易覆盖边界。

### 组件交互测试

使用 Testing Library 从用户角度操作按钮、输入、键盘和弹框。优先验证角色、名称、状态和结果，不用脆弱的 CSS class 查询。

### 可访问性测试

使用 axe 规则和人工键盘走查检查 label、焦点、aria、对比度、对话框焦点陷阱和错误播报。自动化工具不能代替真实键盘和屏幕阅读器检查。

### 视觉回归测试

UI 设计确认后，引入 Playwright 对关键组件和业务组合页截图。截图矩阵至少覆盖 light/dark、comfortable/compact、business/soft/glass 和两个主题色，完整六色矩阵按发布周期执行。

### 浏览器 Smoke

`@playwright/test` 以精确版本作为开发依赖，仅测试已构建的文档站，不进入组件运行时或 npm 发布包。运行 `npm run test:browser` 会先构建 `docs-dist`，再由仓库已有的 Vite preview 托管并启动 Playwright 管理的 Chromium。文档导出固定使用根路径 `base` 与 `publicPath`；若默认 4173 端口被占用，可设置 `PLAYWRIGHT_PORT` 指定其他空闲端口。首次使用需执行 `npx playwright install chromium` 下载浏览器。

浏览器 Smoke 显式检查 `tests/browser/routes.ts` 中的 32 个公开组件路由，使用独立 path/name 映射锁定路由身份，并逐页精确匹配预期 title/H1、至少一个真实运行的 Dumi demo，以及无 `requestfailed`、`pageerror`、console error 或 HTTP 4xx/5xx 响应。检查等待所有请求结束且持续 1 秒静默，最长等待 15 秒；另有延迟 404 与失败请求负向测试验证排空能捕获晚到错误。Tooltip、Input、DynamicForm、Table、Upload、Alert、Spin、Progress 还会在 930、390、320px 检查文档根横向溢出。失败会保存截图和 trace 到 `test-results/browser/`，HTML 报告写入 `playwright-report/`。

需要同时覆盖本机已安装的 Microsoft Edge 时，可运行 `npm run test:browser:all`，它只构建一次，再依次运行 Chromium 与 Edge；`npm run test:browser:edge` 可在已有 `docs-dist` 上单独复跑 Edge。默认命令只依赖 Playwright 管理的 Chromium。当前静态文档部署和浏览器 Smoke 只覆盖站点根路径；子路径托管还需同时配置 Dumi `base` 与 `publicPath` 并增加部署级浏览器验收。该 Smoke 证明列出的路由和基础运行状态可用，不替代组件完整状态、交互、键盘、主题、可访问性、缩放、视觉回归或跨浏览器验收。

## 2. 测试命名

测试名称描述用户行为和结果：

```ts
it('按下 Enter 后提交表单并将焦点移动到错误字段', async () => {
  // ...
});
```

不要用“调用了某个内部函数”作为测试标题，因为那不是用户能依赖的行为。

## 3. 最低覆盖范围

- 所有公开组件至少有基础渲染、主要交互和禁用/错误路径。
- Modal、Drawer、Select、DatePicker、Table、ProTable、QuickField 必须覆盖键盘和异步状态。
- 主题层必须覆盖三种 appearance、六个 color preset、light/dark 和两种 density 的 token 输出。
- 公开入口和 subpath exports 必须有构建级检查。

## 4. 发布前检查

```bash
npm run check:scaffold
npm run format:check
npm run typecheck
npm run lint
npm test
npm run build:lib
npm run build:docs
npm run test:browser
npm pack --dry-run
```

任何失败都要修复或在变更记录中说明原因，不能通过降低覆盖率、跳过测试或关闭规则来“修绿”。
