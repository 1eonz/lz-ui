---
target: Input 文档最终评审
total_score: 31
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 0
target_identity: "file:F:\\work\\lz-ui\\src\\components\\form\\input\\index.md"
target_fingerprint: "sha256:be6816253845f7ba3b65798a62e07cbcb25533acb9bf4de972d96f45b3075fa0"
target_path: "F:\\work\\lz-ui\\src\\components\\form\\input\\index.md"
timestamp: 2026-10-04T11-33-45Z
slug: src-components-form-input-index-md
closed: true
---
Method: dual-agent (A: /root/input_critique_a · B: /root/input_critique_b)

# Input 文档最终评审

日期：2026-10-04。Impeccable 4.1.3，Read 模式。目标为 `src/components/form/input/index.md` 与六个可运行 demo、共享 demo 容器及 Dumi 文档壳。A、B 使用 `gpt-6-luna` max 独立工作；A 评估文档与 UX，B 执行确定性扫描。两个代理的隔离环境都无法打开浏览器；下面单独列出主代理实际浏览器证据，不把它算成子代理检查。

## 设计特异性与评分

内容明确面向 lx-ui 的后台表单开发者，以客户、合同、采购等真实字段讲解 AntD 5 的公开 Input API。六个可运行 demo 覆盖受控、尺寸、状态、前后缀、TextArea 和 ref；章节先展示交互，再给最小用法和 API。视觉沿用 Dumi 文档阅读布局，并以示例主题面板承载当前组件风格。

| # | Nielsen 启发式 | 分数 | 依据 |
| --- | --- | ---: | --- |
| 1 | 系统状态可见性 | 3/4 | 受控输入、错误和字符数有实际状态；未做读屏播报测试。 |
| 2 | 符合真实世界 | 4/4 | 客户、合同、采购字段与 PC 中后台语境一致。 |
| 3 | 用户控制与自由 | 3/4 | 可编辑、清空、聚焦并通过目录跳转；API 长表仍需滚动浏览。 |
| 4 | 一致性与标准 | 3/4 | 示例和 API 分组一致，遵循 AntD 公开组件语义。 |
| 5 | 错误预防 | 3/4 | 说明 label、受控值与校验边界，并演示错误状态。 |
| 6 | 识别而非记忆 | 3/4 | 字段和章节名称明确；17 行参数表仍有查找成本。 |
| 7 | 灵活与效率 | 3/4 | 有尺寸、主题、键盘清空和 ref 示例。 |
| 8 | 简洁与美观 | 3/4 | 交互 demo 先呈现，长 API 与多个主题选项仍会增加页面长度。 |
| 9 | 错误识别与恢复 | 3/4 | 错误状态有文字说明；未测试辅助技术播报。 |
| 10 | 帮助与文档 | 3/4 | Props、事件、TextArea、ref 与审查记录入口齐全。 |
| **总分** |  | **31/40，Good** | 源码评分由 A 提供，主代理补充页面观察。 |

## 评审与检测器

- Assessment A `/root/input_critique_a` 初评和复核均未能取得浏览器能力，按源码评估为 31/40。它提出清除按钮不进入 Tab 顺序；复核后撤回 P2 判定：AntD 清除按钮采用既定 `tabIndex=-1`，Input 仍可通过 Ctrl/Command+A 后 Backspace/Delete 完成键盘清空，相关 demo 旁已有说明。当前没有因此遗留的键盘阻断。
- Assessment B `/root/input_critique_b` 扫描 9 个 markup 文件：Input 文档、6 个 demo、清除图标和共享 demo frame。原始输出 `[]`、退出码 0、命中 0；CSS 未纳入范围。它的浏览器标签创建失败，没有页面 overlay、视口或 console 数据。
- `[]` 只表示确定性规则没有命中，不等于 Impeccable 整体通过。

## 主代理浏览器证据

- Codex In-app Browser 实际渲染 `http://localhost:8000/components/form/input`；正文 H1 为“Input 输入框”，六个 demo 均可访问。桌面首屏可以看到首个 Input demo。
- 1280×720、930×800、390×844、320×760 检查中页面均无根级横向溢出；修复前 930px 搜索框超出约 7px，修复后搜索框跟随 205px 父容器收缩，页面宽度与滚动宽度均为 915px。390px、320px 记录值分别为 375/375 与 305/305。
- 基础受控 Input 聚焦后填入测试值，执行 Ctrl+A 和 Backspace，字段与旁边状态同步变成“未填写”；随后恢复初始“杭州云栖科技”。合同简称与 TextArea demo 旁提供相同的键盘清空说明。
- 页面审查链接打开 `/impeccable-audit` 并呈现记录正文。截图检查为 Dumi 深色外观；浏览器 console 未见新增 warning/error。

## 状态与限制

- 本轮 P2 均已处理：示例导航分组，交互示例前置，键盘替代操作就地说明，平板搜索框不再溢出，审查记录链接实际可达。
- 没有未关闭的 P0/P1/P2。API 参数表较长属于 P3 阅读观察，不阻止任务完成。
- 未验证屏幕阅读器、200%/400% 缩放、系统级 reduced motion、真实粗指针设备、浏览器兼容矩阵或全部主题/密度组合；这些范围不记作通过。
- 开发服务器问题：多个 Dumi 开发实例共用 `.dumi/tmp` 生成目录。停止重复实例并保留单个 8000 实例后，主页、Input、Tooltip 和审查记录路由均返回 200，实际 Input 页面正常渲染。8001 已停止；同时运行多个端口的服务仍不受支持。

## 工程验证

- `npm run check`：通过，42 个测试文件、302 项测试；包括 Prettier、TypeScript、97 个 demo 类型检查和 ESLint。
- `npm run check:scaffold`、`npm run build:lib`、`npm run build:docs`：通过；Dumi 生成全部六个 Input demo 路由。Node `localStorage` experimental warning 不影响退出码。
- `npm pack --dry-run --json`：522 个文件，142,880 B 压缩、678,390 B 解包；无测试或文档 demo 混入。

Questions skipped: 用户已明确要求修复 P1/P2、逐批评审并自动提交推送；本轮 P0-P2 均已关闭，不再询问优先方向。
