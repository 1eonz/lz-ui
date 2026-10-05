# lx-ui 工程协作规则

这份文件是给开发者和自动化工具的快速约束，详细原因和示例见 `docs/project-rules.md`。

## 当前阶段门禁

- Stitch 已交付基础视觉、主题矩阵、P0 组件和业务组合稿，当前进入 P0 implementation。
- 首批实现顺序是主题运行时、基础表单控件、FormItem、DynamicForm；后续业务组件必须组合这些公开能力。
- 每个组件仍必须附对应设计稿或设计评审记录，并通过组件模板、测试、可访问性、浏览器和包体检查。
- 详细规则见 `docs/project-rules.md`，该文件是强制约束，不是建议清单。
- UI 审查执行 `docs/impeccable-workflow.md`；`detect` 返回 `[]` 不等于 Impeccable 通过。每批保留技术审计、独立设计评审、浏览器验证和打磨复测记录。
- 用户于 2026-10-05 最新指定子代理统一使用 `gpt-6-luna` `max`（极高）思考强度，覆盖此前的模型与思考强度设置。模型不可用时记录真实错误，不自动切换模型或伪称复审通过。
- 每批执行实施、独立复审、派回修改、独立复审的闭环，问题关闭后才能进入下一批。设计验收必须检查组件实际渲染及交互，静态说明页或 `tsx pure` 不算可运行 demo。

## 代码规则

- TypeScript strict 必须保持开启；禁止用 `any` 逃避类型设计。
- 组件代码使用函数组件和 hooks；需要 ref 时使用 `forwardRef` 并导出准确的 ref 类型。
- 公开 API 使用命名导出，内部文件可以默认导出。
- 组件目录使用 kebab-case，必须包含 `index.tsx`、`index.module.css`、`index.md`、`types.ts` 和 `__tests__/index.test.tsx`。
- 样式使用 CSS Modules；全局样式只能出现在 `src/styles` 和主题 token 层。
- 主题色、间距、圆角、阴影、动效时长不得在组件中重复写魔法值。
- 优先使用原生语义元素；自定义交互必须说明键盘、焦点和屏幕阅读器行为。
- 公开 API 和非显然逻辑必须写详细 JSDoc/注释，说明为什么这样做、边界是什么、代价是什么、如何扩展或回退；不要重复代码字面含义。具体检查项见 `docs/project-rules.md` 第 4.2 节。
- 项目自有代码的所有注释和 JSDoc 必须使用中文，包括组件、类型、CSS、测试、示例、脚本和配置；API 标识符、标准术语与工具要求的指令可保留原文。第三方代码和只读设计输入不改写。

## 依赖和性能

- 新依赖必须说明功能收益、包体影响、维护风险和不引入它的替代方案。
- React、ReactDOM、Ant Design 作为 peer dependency，不打进普通 npm 产物。
- 不依赖 Ant Design 私有 DOM 结构和未公开 API。
- 每个组件必须考虑 loading、empty、error、disabled、focus 和 reduced motion 状态。
- 表格、列表和下拉内容要避免一次渲染大量 DOM；虚拟化作为明确的能力，不默认强制开启。

## 提交流程

1. 先核对 `UI/` 设计证据和相关设计/架构文档，再改代码。`UI/` 和旧项目均为只读参考。
2. 只对本次修改的代码与文档执行 Prettier 写入；禁止对全仓执行 `npm run format`。运行 `npm run format:check` 验证。
3. 运行 `npm run check:scaffold`、`npm run typecheck`、`npm run typecheck:docs`、`npm run lint`、`npm test`、`npm run build:lib` 和 `npm run build:docs`。文档示例不进入库产物，但必须按公开源码 API 单独检查类型。
4. UI 交付必须按 `frontend-ui-ux` 与 Impeccable 检查真实浏览器中的焦点、暗色、密度、窄屏和动效降级，主代理复审通过后才能公开导出。
5. 变更公共 API、主题 token、依赖和构建出口时，必须更新变更记录和迁移说明。
6. 用户已授权每批验收后自动提交并推送：先格式化本批文件，再执行 Impeccable、独立 code review、返工复审和工程门禁，检查差异后提交到当前分支并普通 push。不得强制推送、混入无关改动或提交未关闭的代码问题；浏览器工具受限时必须记录未验收范围，不能把提交称为完整视觉交付。
