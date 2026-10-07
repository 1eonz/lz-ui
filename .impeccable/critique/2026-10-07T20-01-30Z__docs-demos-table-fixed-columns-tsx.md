---
target: Table 详情标题窄容器 polish 复核
total_score: 30
max_score: 40
p0_count: 0
p1_count: 0
p2_count: 0
p3_count: 2
na_heuristics: 0
method: "dual-agent (A: table_title_design_review; B: table_title_technical_review)"
target_identity: "file:F:\\work\\lz-ui\\docs\\demos\\table-fixed-columns.tsx"
target_fingerprint: "sha256:0cab7c592a0e905dd32fe6f64be1bb885f9a85cd7087a020991781f89034d49f"
target_path: "F:\\work\\lz-ui\\docs\\demos\\table-fixed-columns.tsx"
timestamp: 2026-10-07T20-01-30Z
slug: docs-demos-table-fixed-columns-tsx
---
Method: dual-agent (A: table_title_design_review · B: table_title_technical_review)

# Table 详情标题窄容器 polish 复核

目标为 `docs/demos/table-fixed-columns.tsx`、其 CSS Module、Table 文档及当前 Dumi 页面。设计依据为 `UI/P0 基础组件-Data Display/DESIGN.md` 和 lx-ui 主题 token。Impeccable 4.1.3；本会话已执行 `context.mjs --target docs/demos/table-fixed-columns.tsx` 一次。首次发现的问题已在本轮修复并完成第二轮 A/B 复核。

## Assessment A

设计特异性中高。订单金额、审批状态、供应商、部门和采购员使详情内容贴合采购场景。桌面展示 5 个相同详情入口，略增加选项数量；七个详情字段以 2+3+2 分组，顺序符合业务核对任务。

| # | Nielsen 启发式 | 分数 | 依据 |
|---|---|---:|---|
| 1 | 系统状态可见性 | 3/4 | 打开后展示详情并聚焦标题，关闭后返回触发操作。 |
| 2 | 贴近现实世界 | 4/4 | 采购字段、金额和审批状态清楚。 |
| 3 | 用户控制与自由 | 3/4 | 有明确关闭操作，焦点回到触发按钮。 |
| 4 | 一致性与标准 | 3/4 | 详情分组和表格操作符合后台常见模式。 |
| 5 | 错误预防 | 3/4 | 详情只读，入口按订单编号命名。 |
| 6 | 识别而非回忆 | 3/4 | 字段标签明确，编号在标题重复呈现。 |
| 7 | 灵活性与效率 | 3/4 | 鼠标、键盘均可使用，Tab 会滚入隐藏操作。 |
| 8 | 简洁与审美 | 3/4 | 层级和分组清楚；极窄布局需额外空间。 |
| 9 | 错误识别与恢复 | 2/4 | 固定列示例使用静态数据，没有错误恢复状态。 |
| 10 | 帮助和文档 | 3/4 | 说明滚动和阈值，但缺少操作时机帮助。 |
| **合计** |  | **30/40** | **Good** |

首轮在 320px 实测详情宽 190px、标题宽 88px、编号宽约 103px；编号伸出焦点框，并靠近关闭操作约 3px，归类 P2。现使用详情容器宽度不高于 220px 的 `@container` 规则，将标题扩为整行并把关闭操作放到标题下方。第二轮 A 复审为 GO：标题框 `164 × 48px`，编号完全位于标题盒/焦点轮廓内，关闭操作与标题间隔 12px；390px 和 1440px 也无交叠。打开和关闭焦点路径保持正确。

保留两项范围内可接受的 P3 观察：桌面有 5 个相同详情入口；行选择没有对应批量操作。它们不阻断当前以固定列和详情阅读为主的示例。

## Assessment B

技术与代码审查为 **GO / Approved**，五维 **18/20（Excellent）**：无障碍 3/4、性能 4/4、主题 3/4、响应式 4/4、实现完整性 4/4。没有可复现 P0–P3。容器查询仅用于 demo 布局，无 JS、公开 API 或 AntD 私有 DOM 依赖；浏览器断言覆盖编号在标题盒内及不与关闭操作相交。

Detector 命令：`node C:/Users/Administrator/.codex/skills/impeccable/scripts/detect.mjs --json docs/demos/table-fixed-columns.tsx`

原始 stdout 为 `[]`，stderr 为空，退出码 0。该结果只代表扫描规则未命中，不判断视觉或运行时行为。

## 浏览器证据

独立 Chromium 149 contexts 覆盖 1440、930、390、320 CSS px。所有路由返回 HTTP 200；页面及详情无横向溢出，page/console/request 错误为空。四档分组顺序均为“审批与金额 → 订单信息 → 采购归属”。320px 打开 `PO-2026-1042` 后编号位于标题焦点框内，关闭按钮在标题下方且不重叠。键盘 Enter 打开、Tab 到关闭、Enter 关闭后焦点回到原触发按钮。

`npx playwright test tests/browser/table-demo.spec.ts --project=chromium --reporter=line --output <Temp>` 通过 10/10。A 组截图：`C:\Users\Administrator\AppData\Local\Temp\lxui-table-assessment-a-round2-TX1fGz`；B 组截图：`C:\Users\Administrator\AppData\Local\Temp\lx-ui-table-assessment-b-20261008`。

## 工程门禁与边界

最终 `npm run check` 通过：55 个测试文件、606 项测试、104 个 demo 类型检查。`npm run check:scaffold`、`npm run build:lib`、`npm run build:docs` 通过；Dumi 导出 160 个 HTML、480 个本地资源引用及 89 个嵌套 demo。真实屏幕阅读器、真实 200%/400% page zoom、Safari、实体触控、完整 Table 主题/密度矩阵和目标部署不在本轮验证范围；此批不关闭 Table 全矩阵或全库 2B-1。

Questions skipped: 本轮是已授权的窄范围 polish，没有待决产品选择；未解决的更广验收项列在 docs/roadmap.md。
