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
npm pack --dry-run
```

任何失败都要修复或在变更记录中说明原因，不能通过降低覆盖率、跳过测试或关闭规则来“修绿”。
