# lx-ui 文档导航

当前阶段的文档用于把工程约束提前固定下来，避免 UI 设计完成后因为目录、构建、动画或性能规则不清晰而返工。

| 文档                     | 用途                                            |
| ------------------------ | ----------------------------------------------- |
| `architecture.md`        | 模块边界、依赖方向、构建出口和扩展路线          |
| `project-rules.md`       | 代码格式、命名、注释、样式、状态和评审规则      |
| `performance.md`         | 包体、运行时、渲染、Core Web Vitals 和性能门槛  |
| `animation.md`           | 动效用途、时长、缓动、reduced motion 和组件状态 |
| `component-template.md`  | 组件落地前的目录、API、文档和测试模板           |
| `testing.md`             | 单元、交互、可访问性、视觉回归和发布前检查      |
| `release.md`             | 版本、变更记录、npm 私库和回滚流程              |
| `ui-design-gate.md`      | Stitch 设计交付和开始实现前的门禁               |
| `impeccable-workflow.md` | UI 技术审计、独立设计评审与浏览器复测的强制流程 |
| `impeccable-audit.md`    | 当前批次的 Impeccable 证据与问题状态            |
| `p0-execution-plan.md`   | P0 组件依赖顺序、公开 API 决策和逐批验收标准    |
| `adr/`                   | 重要架构决策及其优缺点                          |

UI 设计确认后，组件文档继续放在对应组件目录的 `index.md`，保持参考项目中“代码、样式、文档相邻”的使用习惯。
