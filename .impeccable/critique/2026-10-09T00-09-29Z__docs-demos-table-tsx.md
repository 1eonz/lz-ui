---
target: Table 订单详情与信息分组
total_score: 33
max_score: 40
na_heuristics:
p0_count: 0
p1_count: 0
p2_count: 0
target_identity: "file:F:\\work\\lz-ui\\docs\\demos\\table.tsx"
target_fingerprint: "sha256:d8b89ab9f6240fafa47552268177f27aeb1ef2ac6e790d90bb7561d062604dbe"
target_path: "F:\\work\\lz-ui\\docs\\demos\\table.tsx"
timestamp: 2026-10-09T00-09-29Z
slug: docs-demos-table-tsx
closed: true
---
Method: dual-agent (A: /root/table_design_critique · B: /root/table_evidence_audit)

# Table 订单详情与信息分组评审

目标：`docs/demos/table.tsx`、`docs/demos/table-fixed-columns.tsx`、`docs/demos/table-demo.module.css`、Table 文档和相关浏览器测试。设计依据：`DESIGN.md`、`UI/P0 基础组件-Data Display/DESIGN.md`、现有 lx-ui 语义 token。Impeccable 4.1.3，Operate/Read 场景。

## 设计特异性

采购金额、审批、下单日期、采购员、部门、完成项和计划到货日期使详情明确属于采购订单工作流。三组信息在宽屏并列、窄屏单列，使用描述列表维持标签和值的对应关系；详情标题重复订单号，降低切换上下文时的记忆负担。整体遵循现有商务后台表格语言。

## Nielsen 启发式评分

| # | 启发式 | 分数 | 证据 |
|---|---|---:|---|
| 1 | 系统状态可见性 | 3/4 | 详情区域、订单号、展开状态和履约百分比可见。 |
| 2 | 系统与现实匹配 | 4/4 | 采购金额、审批、履约、采购员和到货日期使用业务术语。 |
| 3 | 用户控制与自由 | 3/4 | 有关闭入口，键盘与触控关闭后恢复原触发焦点。 |
| 4 | 一致性与标准 | 4/4 | 使用描述列表、语义分组、公开 ARIA 关系和可见焦点。 |
| 5 | 错误预防 | 3/4 | 只读详情沿用同一订单对象，表格和详情使用同一完成项口径。 |
| 6 | 识别而非记忆 | 4/4 | 每个值都有字段标签，标题重复订单号，同时显示项数与百分比。 |
| 7 | 灵活与高效 | 3/4 | 支持鼠标、键盘和触控，宽屏三列、窄屏单列。 |
| 8 | 美观与简洁 | 3/4 | 金额强调和组间分隔清楚；文档 demo 边界较多但不影响任务。 |
| 9 | 错误恢复 | 3/4 | 列表变化关闭详情并处理焦点，关闭回到对应入口。 |
| 10 | 帮助与文档 | 3/4 | 文档说明分组、项数口径、焦点和窄屏边界。 |
| **合计** |  | **33/40** | 初始独立 UX 评审分数；P2 数据口径问题已在本轮关闭。 |

## 已关闭问题

- **P2：** 详情原先只显示 `41 / 50 项`，用户需要心算列表中的 `82%`；现在显示 `41 / 50 项 · 82%`，由同一函数计算。
- **P2：** 固定列详情未确保标题、首组和关闭入口同时可见；主 Table 与固定列 demo 共用 `focusDetailRegion`，按滚动边距和几何定位后再聚焦标题。
- **P3：** 固定列订单号引用旧 CSS Module 类；两种详情统一使用 `orderDetailsTitleId`。

## 证据与限制

- 最新 Dumi 导出：160 个 HTML、480 个本地 JS/CSS 引用、89 个嵌套 demo。
- Chromium Table 与触控专项 12/12；WebKit smoke 2/2。覆盖详情分组、履约百分比、焦点恢复、固定列窄屏、粗指针和根节点溢出；browser-health 无错误。
- Impeccable detector 对本批目标原始 stdout 为 `[]`、stderr 为空；这只代表确定性规则没有命中。
- 定向 Vitest：demo 26/26，Table 适配层 21/21；jsdom 伪元素 `getComputedStyle` 是既有测试噪声。
- Dumi dev 8000 端口存在独立 `AtomRenderer` 客户端错误，最终验收使用最新 `docs-dist` Vite preview。
- 未覆盖真实屏幕阅读器、200%/400% page zoom、Safari 实机、实体触控、设备性能和目标部署；全库 2B-1 继续开放。

## 保留观察

- **P3：** 宽屏 demo 有多个详情入口，示例行选择没有批量动作；这是演示范围取舍。
- **P3：** 完整宽表在手机上仍需横向寻找详情入口；文档已说明应另行设计响应式列或卡片视图。
