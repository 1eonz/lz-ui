# lx-ui

面向 React PC 中后台的 UI 组件库，目标场景包括 ERP、CRM、商城运营、客服和数据管理后台。

当前仓库处于 **P0 实现阶段**。Stitch 设计保存在 `UI/`；首批主题运行时、基础表单控件和 DynamicForm 正在集成验收。其他组件仍需逐个通过设计、交互和性能门禁。

## 当前已经具备

- React + TypeScript 的类库工程入口。
- React 18/19 与 Ant Design `>=5.24 <6` peer dependency 约束；首版不承诺 React 16/17 或 AntD 4。最低版本的验证状态见 `docs/compatibility.md`。
- Dumi 文档站配置和 Father 类库构建配置。
- CSS Variables + CSS Modules 的主题与组件样式。
- 三种风格、六个基础主题色、七套东方配色、明暗模式和两种密度。
- 首批 Button、Input、TextArea、Select、InputNumber、DatePicker、FormItem 和 DynamicForm。
- ESM、CJS、类型声明和 CSS 出口；UMD 仍在规划中。
- ESLint、Prettier、TypeScript、Vitest 和脚手架检查。
- 项目架构、代码规则、性能、动画、测试、发布和组件模板文档。

## 开发命令

```bash
npm install
npm run check:scaffold
npm run typecheck
npm run lint
npm run test
npm run dev:docs
```

`npm run build` 会在构建前执行完整检查。项目规则见 `docs/project-rules.md`，项目脑图见 `docs/project-mindmap.md`。

## 目录速览

```text
src/components/   已批准的基础组件和后续分类
src/theme/        主题 Provider、类型和 token 映射
src/styles/       CSS cascade layer 和样式入口
docs/             工程规则、架构、性能、动画和开发指南
examples/         后续业务页面示例
tests/            集成测试和测试初始化
scripts/          脚手架检查、清理和发布保护
design.md         产品与组件库总体设计方案
```

## 关键文档

- [总体设计方案](./design.md)
- [项目架构](./docs/architecture.md)
- [项目规则](./docs/project-rules.md)
- [性能预算](./docs/performance.md)
- [交互动画规则](./docs/animation.md)
- [组件开发模板](./docs/component-template.md)
- [测试策略](./docs/testing.md)
- [发布流程](./docs/release.md)

## 重要边界

1. 主包只围绕 Ant Design 5 设计；Ant Design 4 不进入同一版本的主包。
2. 组件必须先核对 `UI/` 中的对应设计，并按 `docs/ui-design-gate.md` 逐项验收。
3. business 组件不得直接依赖业务项目的请求、权限、路由或状态管理。
4. 任何新增依赖、全局样式、公共 API 和动画都要在评审中说明原因、收益、代价和替代方案。
5. 需要发布前，把 `package.json` 的 `private` 从 `true` 改为 `false`，并通过发布保护脚本。
