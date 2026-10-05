---
target: DynamicForm demo and API documentation
total_score: 29
max_score: 40
p0_count: 0
p1_count: 1
target_identity: "file:F:\\work\\lz-ui\\src\\components\\form\\dynamic-form\\index.md"
target_fingerprint: "sha256:280d23b68cb669fe097c24a44609723b1b3cbcbca87fe73fdd9e3fe42ad53411"
target_path: "F:\\work\\lz-ui\\src\\components\\form\\dynamic-form\\index.md"
timestamp: 2026-10-05T05-09-34Z
slug: src-components-form-dynamic-form-index-md
closed: true
---
## 2026-10-05 独立体验评审与浏览器证据

**目标：** `src/components/form/dynamic-form/index.md`、`src/components/form/dynamic-form/index.tsx`、`docs/demos/dynamic-form.tsx`、`docs/demos/dynamic-form-cascade.tsx`。<br>
**方式：** Assessment A 与 Assessment B 分别由独立 `gpt-6-luna max` 子代理完成。A 未接触 detector 输出；B 在 A 完成后独立运行 detector 并检查新浏览器标签。<br>
**设计依据：** 当前 Stitch Form 视觉输入、`design.md`、DynamicForm 的 CRM/ERP 客户录入工作流和 `docs/project-rules.md`。本轮为既有界面打磨，不改变产品视觉方向。

### Assessment A：设计评审

**设计特异性：中等。** 客户、供应商、区域等字段和 ERP/CRM 新建场景提供了明确业务语境；完整录入示例中的重点客户负责人联动也有实际含义。Form 设计输入主要覆盖基础控件矩阵，没有 DynamicForm schema、条件显示、异步级联或提交恢复的专门稿件。当前整体视觉仍依赖标准表单和 Dumi 文档框架。

**Nielsen 启发式：29/40（Good）**

| 启发式 | 分数 | 证据 |
| --- | ---: | --- |
| 系统状态可见 | 3/4 | 校验、加载、保存状态有反馈；异步选项重试结果仅对辅助技术提供成功播报。 |
| 贴近现实世界 | 4/4 | 客户、供应商、客户等级等中后台概念清楚，字段顺序符合录入流程。 |
| 用户控制与自由 | 3/4 | 有重置、重试、继续新增和查看客户操作。 |
| 一致性与标准 | 2/4 | 暗色文档页中，多级级联示例仍显示白色表面。 |
| 错误预防 | 3/4 | 必填、邮箱校验和依赖字段清理阻止常见错误。 |
| 识别而非回忆 | 3/4 | 标签、占位提示和帮助文案清楚；部分异步行为仍要查阅较长说明。 |
| 灵活与效率 | 3/4 | 有受控回填、条件字段、renderer 注册和异步搜索；未覆盖数组增删行模式。 |
| 美观与简约 | 2/4 | 表单主流程清楚，文档目录和 API 内容密集。 |
| 错误识别与恢复 | 3/4 | 提交失败保留值并可重试；恢复操作附近可能看不到失败解释。 |
| 帮助与文档 | 3/4 | 有场景示例、API 表和边界说明，学习路径仍较长。 |

认知负荷中等，8 项清单中 2 项未通过：异步行为说明较密，文档侧栏同屏出现 12 个同级章节。Jordan 初次使用者能依靠字段说明填写，但异步重试后的可见确认不足；Sam 辅助技术用户可收到必填、邮箱和异步状态播报，未使用真实屏幕阅读器或完成全程 Tab 测试；Casey 移动用户未完成窄屏检查。

### Assessment B：detector 与浏览器证据

- 确定性 detector 对 6 个 markup/文档目标运行，未传 CSS。原始 JSON 为 `[]`，退出码 0；这只说明这些确定性规则没有命中，不构成视觉或交互通过。
- 新标签在 `1280×720` 暗色视口打开目标页。检测器注入后报告 62 项：`cramped-padding` 11、`line-length` 30、`ai-color-palette` 16、`low-contrast` 4、`layout-transition` 1。长行命中集中于文档文字；16 项配色命中来自代码高亮 `span.token.keyword`，属于假阳性；低对比命中位于 Dumi 页脚文本，实测约 3.7:1；高度过渡命中 `body`。再次运行产生的 7 项高亮标签遮挡属于检测器自标记误报。
- 异步供应商示例可搜索“杭州”并复现错误；重试后播报找到 1 个选项。页面下拉关闭、搜索词仍显示，无法在当前字段界面确认新候选结果，视觉用户需要自行再次展开。
- 级联示例可更换城市，区域变更时会清空城市和区县并禁用区县；这条行为通过浏览器验证。级联表面与当前暗色文档主题不一致。
- 提交示例首次保存失败后显示恢复按钮。A 观察到错误说明与恢复按钮可能分处不同滚动位置，用户聚焦到按钮时失败解释滚出视口；浏览器环境只覆盖桌面暗色状态。
- 浏览器检测器页面 overlay 确认注入；B 结束时停止并确认关闭了临时 8401 服务。

### 优先问题

1. **[P1] 提交失败解释可能离开恢复操作的视口。** 用户能聚焦“重试保存”却看不到输入保留等关键信息。让错误说明和重试动作在提交结果后保持同屏可见，或在恢复焦点时将错误内容带入视口；重新验证键盘焦点和滚动位置。
2. **[P2] 异步选项重试成功缺少视觉确认。** 重试成功目前只更新屏幕阅读器播报和内部候选；提供清晰的可见结果反馈，并确认可再次搜索和选择，不重复打扰。
3. **[P2] 级联示例主题和文档不一致。** 根据 Dumi 当前 light/dark 模式设置该 demo 的外层主题，同时保留 demo 内局部主题设置的独立性。
4. **[P2] DynamicForm 文档目录及说明密集。** 收紧同级导航并将异步加载说明按查询、失败恢复和依赖刷新拆段；保留完整 API 和边界内容。

### 范围与限制

本轮未检查 930px 中间宽度、320–390px 窄屏、键盘全流程、真实屏幕阅读器、200% 放大、reduced motion、浅色或全主题/密度矩阵。B 未验证提交重试成功，A 未完成级联旧值清除浏览器复现；本报告不会把这些项目推断为通过。代码正确性另由独立 code review 检查。

Questions skipped: 用户已授权按路线图自动继续，本批没有待确认的产品决策。
