---
target: DynamicForm submission and documentation
total_score: 37
max_score: 40
na_heuristics:
p0_count: 0
p1_count: 0
target_identity: "file:F:\\work\\lz-ui\\src\\components\\form\\dynamic-form\\index.md"
target_fingerprint: "sha256:eccf105de2c4e1ff2c9e90d0018481ded4f825d3af8443746ff1682b46409539"
target_path: "F:\\work\\lz-ui\\src\\components\\form\\dynamic-form\\index.md"
timestamp: 2026-10-04T16-25-13Z
slug: src-components-form-dynamic-form-index-md
closed: true
---
⚠️ DEGRADED: single-context（两次 gpt-6-luna max 子代理请求均因额度预扣失败返回 403；独立 Assessment A/B 未完成）。detector 的 `[]` 在本次手工评估前已产生，所以不作为独立结论；没有 overlay。以下 UX 与代码评估来自主代理的本地源码和浏览器观察。

## Nielsen 启发式：37/40

| 项目 | 分数 | 观察 |
|---|---:|---|
| 系统状态可见 | 4/4 | 提交、失败和成功状态有可见反馈。 |
| 贴近用户语言 | 4/4 | 以 CRM 客户录入和保存动作为例。 |
| 用户控制与自由 | 3/4 | 有重试、重置和继续新增；请求中没有取消动作。 |
| 一致性与标准 | 4/4 | 遵循表单、校验、错误和按钮的既有用法。 |
| 错误预防 | 4/4 | 必填校验和首错字段聚焦。 |
| 识别而非记忆 | 4/4 | 错误旁有重试，失败值保留。 |
| 灵活与效率 | 3/4 | 支持键盘提交，主题选项折叠。 |
| 简洁与审美 | 3/4 | 示例逐步展开，完整 API 文档较长。 |
| 错误恢复 | 4/4 | 失败、保值、重试和成功均可操作。 |
| 帮助与文档 | 4/4 | 说明错误 API、ref 和宿主负责的请求边界。 |

## 设计特异性

客户录入、客户等级和邮箱使完整示例对应 ERP/CRM 中后台场景。提交状态和恢复动作靠近表单，局部外观设置默认折叠。

## 优先问题

- [P2，已修复] 从错误中的重试按钮提交时，按钮会卸载；原实现可能把焦点留在页面根节点。现按结果聚焦新重试或成功操作，并有测试覆盖。
- Dumi demo ID 含 `/` 时自动 URL 原先未编码，开发站独立 demo 无法打开。默认 URL 已修复并通过本地实际链接验证；静态托管服务器对 `%2F` 的处理仍待验证。

## 人工核验

空提交聚焦首个错误字段；模拟失败保留输入，重试成功；继续新增后焦点进入新客户名称。独立 demo 的 Enter 失败与成功路径均通过。编码 ID 的独立开发 URL 可打开。

主代理没有发现当前差异中的 P0/P1。由于模型服务额度不足，未获得独立 UX/code review 结论。窄屏视口、静态部署、读屏、高倍缩放、系统 reduced motion、全主题矩阵和 React 19 仍未验证。

Questions skipped: 用户已明确要求按路线图自动持续推进，本批没有待决策项。
