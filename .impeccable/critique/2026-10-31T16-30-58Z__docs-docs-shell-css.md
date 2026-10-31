---
target: Dumi 文档壳与源码高亮对比度
total_score: 31
max_score: 40
na_heuristics: ''
p0_count: 0
p1_count: 0
target_identity: "file:F:\\work\\lz-ui\\docs\\docs-shell.css"
target_fingerprint: "sha256:b29029f10ad5d6469a93adcbbc970cc7c97939a29fe0ba48998631319495b227"
target_path: "F:\\work\\lz-ui\\docs\\docs-shell.css"
timestamp: 2026-10-31T16-30-58Z
slug: docs-docs-shell-css
---
Method: dual-agent (A: dynamic_form_design_a_1031; B: dynamic_form_audit_b_1031)

目标：docs/docs-shell.css，DynamicForm/Input 两个文档页。Read 模式，保持现有组件文档风格，只修正文档壳与源码展示对比度。

| Nielsen 项目 | 分数 | 依据 |
| --- | --- | --- |
| 系统状态可见性 | 3 | 当前组件和章节位置明确 |
| 系统与现实匹配 | 4 | 组件名、用法、API 符合开发者习惯 |
| 用户控制与自由 | 3 | 导航、目录及前后篇路径明确 |
| 一致性与标准 | 3 | 两页浅深色映射一致 |
| 错误预防 | 3 | 用法与约束说明可读，代码结构可辨 |
| 识别而非记忆 | 3 | 导航、标题与语言标签提供上下文 |
| 灵活性与效率 | 3 | 桌面目录和移动侧栏可扫描 |
| 美观与简约 | 3 | 多色高亮有区分，正文保持阅读优先 |
| 错误识别与恢复 | 3 | 文档边界与后续导航明确，本批未重测完整 demo 恢复 |
| 帮助与文档 | 3 | 源码、解释和参考链接衔接完整 |
| 合计 | 31/40 | 仅文档壳范围 |

设计特异性：面向组件使用者的技术文档，导航、API、示例与源码构成阅读路径；保留已有结构，不加入营销元素。两页源码实测分别保留 6/5 种颜色，真实 demo 输入继续消费组件文字 token。

优点：正文和代码层级明确；浅深色语法语义清楚；文档辅助色、链接色与组件主题隔离，降低后续维护时的误覆盖风险。

技术审计：无障碍、性能、主题、响应式、实现完整性各 3/4，15/20。评分保持 B 首次独立评审值，不因返工推测上调。唯一一次 markup detector stdout 为 []、stderr 为空、exit 0，仅表示确定性规则未命中。一次真实 overlay 总计 12 项：low-contrast 1、line-length 1、nested-cards 8、heading-rhythm 2；Dumi 示例框和既有阅读节奏提示未直接当作新缺陷。没有把空结果当作验收。

优先问题及关闭：B 发现“最后更新时间：”标签与 time 为兄弟节点，原规则只给日期映射辅助色，标签浅色 3.215956:1、深色 3.688235:1，为 P1。现改为 content-footer 继承辅助色，页间链接仍有显式链接色。新构建两页明暗的标签和 time 共 8 个可见样本全部通过，浅色 5.216353:1、深色 9.111728:1，P1 已关闭。其余原目标最低浅色 4.942646:1、深色 8.307584:1。范围内无其余可复现 P0–P3。

认知负荷与情绪路径：本批未新增选项或状态；现有侧栏按组件和章节组织。阅读从示例进入用法与 API 后仍可通过导航离开，未重测业务提交路径的情绪状态。

角色风险：低视力用户仍需全站文字及真实读屏验收；键盘用户在 Windows WebKit 的 Tab 偏好存在平台限制，不能用脚本聚焦样式检查冒充可达性通过。普通 Tab/Alt+Tab 在裸 HTML 上也跳过链接，公开配置不能切换；本批显式标注脚本聚焦后的键盘输入模态与 :focus-visible 对比度边界。Chromium/Edge 保留真实相邻 Tab/Shift+Tab。

次要观察：既有侧栏较长，但本批不改变信息架构；代码块在窄屏由自身横向滚动承载，未将源码压成单色或强制折断所有标识符。

证据与边界：A 查看两页 × 1440/390 × light/dark 共 8 场景，无 pageerror/根溢出；B 在独立 fresh context 采样实际文字，合成祖先背景及 placeholder opacity。原始证据在 .codex/docs-contrast-a-20261101 与 .codex/docs-contrast-b-20261101，标签关闭记录为 p1-closure.json。没有覆盖全站、真实 200%/400% page zoom、Safari 实机、实体触控、读屏或部署性能。请求模型配置为 gpt-6.1-sol medium，独立代码复审为 high，工具未暴露运行身份核验能力。

Questions skipped: 用户已授权持续按计划执行，范围内问题已关闭，无新增产品决策需要确认。
