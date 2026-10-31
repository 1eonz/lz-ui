---
target: DynamicForm 文档完整客户录入
total_score: 32
max_score: 40
na_heuristics: ''
p0_count: 0
p1_count: 0
target_identity: "file:F:\\work\\lz-ui\\docs\\demos\\dynamic-form.tsx"
target_fingerprint: "sha256:df0e0c8b8ce603dbc76eb179ca3ff11a3e3d8e1b5c54fe28f256eb01e9fc6d20"
target_path: "F:\\work\\lz-ui\\docs\\demos\\dynamic-form.tsx"
timestamp: 2026-10-31T15-59-43Z
slug: docs-demos-dynamic-form-tsx
---
Method: dual-agent (A: dynamic_form_design_a_1031; B: dynamic_form_audit_b_1031)

目标：DynamicForm 文档完整客户录入及相邻独立示例。Read 文档与 Operate 表单组合；保留既有 Form 设计，关注识别、恢复和连续录入。

| Nielsen 项目 | 分数 | 依据 |
| --- | --- | --- |
| 系统状态可见性 | 3 | 校验、失败、成功及后续动作就地呈现 |
| 系统与现实匹配 | 4 | 客户、等级、邮箱与负责人符合 CRM |
| 用户控制与自由 | 3 | 重试、重置及继续新增可完成 |
| 一致性与标准 | 3 | 原生折叠与表单语义，标题对齐问题已修复 |
| 错误预防 | 3 | 必填、邮箱及条件负责人校验 |
| 识别而非记忆 | 3 | 标签和字段说明就地呈现 |
| 灵活性与效率 | 3 | 快速跳转与连续新增 |
| 美观与简约 | 3 | 低频设置默认折叠 |
| 错误识别与恢复 | 4 | 失败保留输入并原位重试 |
| 帮助与文档 | 3 | 分组运行示例及 API 说明 |
| 合计 | 32/40 | 保留初次评估分数，不因修复推断加分 |

产品特异性：ERP/CRM 任务明确，字段联动、校验与失败恢复形成后台录入闭环。设置默认折叠，连续新增保留主要工作方向；无额外装饰或营销化页面。

技术审计：无障碍、性能、主题、响应式、实现完整性均为3/4，总计15/20，限定为本轮抽样证据。4.6 CLI 对七个 TSX 的原始输出 [] 只表示无确定性命中。浏览器 overlay 在既有文档页报告20项：9对比度、8示例框架嵌套、2标题节奏、1行长；语境误报不机械计数为缺陷。

重点问题：

1. P3 折叠标题分散、窄屏箭头另占一行。三列网格与明确标题节点修复；最新产物1280/390/320px截图、原生展开/收起与触控回归确认关闭。
2. 文档外围 P1 对比度候选，涉及搜索placeholder、活动导航、正文链接与语法配色。旧产物overlay不能证明当前源码缺陷，须在最新产物核实并由文档壳批次处理；未宣称全站WCAG通过。

角色检查：键盘熟练用户可快速跳转并恢复提交；首次录入用户有就地标签和校验；触控用户以粗指针媒体硬断言和真实合成tap检查44px目标。真实读屏和实体设备未验，不能从ARIA或仿真推断。

最终验证：最新隔离导出165 HTML、660本地资源引用、93 demo；Chromium/Edge/Windows Playwright WebKit各6项，共18/18。全量59文件/689 Vitest及8锁测试通过，112 demo类型检查通过。CSS文本放大不等于真实页面缩放。实际模型身份未由工具核验，配置为gpt-6.1-sol medium评估及high代码复审。

Questions skipped: 仅2项重点问题，布局已修复，对比度候选按用户既有授权继续核实。
