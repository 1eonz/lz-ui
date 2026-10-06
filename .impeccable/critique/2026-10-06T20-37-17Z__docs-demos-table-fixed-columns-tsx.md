---
target: Table 固定列订单详情
total_score: 30
max_score: 36
na_heuristics: 9
p0_count: 0
p1_count: 0
target_identity: "file:F:\\work\\lz-ui\\docs\\demos\\table-fixed-columns.tsx"
target_fingerprint: "sha256:2f41976fc243c3c818f17358e95f675deef0fc2e28b6f17b784757bed0d283ce"
target_path: "F:\\work\\lz-ui\\docs\\demos\\table-fixed-columns.tsx"
timestamp: 2026-10-06T20-37-17Z
slug: docs-demos-table-fixed-columns-tsx
---
# Impeccable Critique: Table 固定列订单详情

- **目标与模式：** `docs/demos/table-fixed-columns.tsx`，Read 模式。设计方向来自 ERP 采购订单的实际阅读任务、现有 Table 设计稿和项目语义 token。Assessment A 与 Assessment B 由互相隔离的 `gpt-6-luna max` 子代理完成；Assessment A 在查看检测器结果前完成。代码复审另由独立子代理完成。
- **设计特异性判断：** 设计扎根于采购后台，而非通用详情卡片：订单信息、采购归属、审批与金额对应用户的检索顺序；长供应商名称、审批状态和金额使用各自适合的呈现方式。桌面并列分组、窄屏按相同顺序单列阅读。
- **Nielsen 启发式评分：** 系统状态可见性 3/4；现实匹配 4/4；用户控制与自由 3/4；一致性与标准 4/4；错误预防 3/4；识别优于记忆 4/4；灵活性与效率 3/4；简约设计 3/4；错误恢复 N/A（静态只读示例没有编辑或破坏性流程）；帮助与文档 3/4。总分 **30/36（83%，Good）**。
- **认知负荷与情绪路径：** 认知负荷较低，七个字段按三个有业务含义的组组织，没有超过四项的选择集合。用户打开详情后能确认完整字段；标题获得焦点，关闭后返回原行操作。窄屏读者需向下浏览到金额和审批状态，反馈完整但缺少可优先扫读的摘要。
- **主要优点：** 详情区域具名且可由触发按钮通过 `aria-controls`/`aria-expanded` 定位；语义化描述列表让标签和值可以成对阅读；切换记录和关闭时的焦点位置明确；长名称在 320px 和 390px 下换行且没有页面横向溢出。
- **优先观察：** P3：移动端金额与审批字段位于第三组，快速扫读需要向下滚动；P3：固定列阈值说明与横向滚动提示相邻且部分重复。A 组认为分组仍清晰，两个提示承担不同任务，本批无需改动。
- **人物风险：** 移动端采购人员定位审批结果的路径较长。键盘用户仍不能用方向键浏览纯文本单元格；Ant Design 5.24 的公开 Table API 不提供该能力，本批没有通过私有 DOM 处理，已作为独立 P2 记录。真实屏幕阅读器尚未实测。
- **Assessment B 检测与浏览器证据：** 源码 detector 命令 `node C:/Users/Administrator/.codex/skills/impeccable/scripts/detect.mjs --json docs/demos/table-fixed-columns.tsx` 输出 `[]`、退出码 0，含义仅为确定性规则没有命中。浏览器注入成功，overlay 标出 11 组元素；逐项检查后均属于 Dumi 导航/设置面板、隐藏设置文字、Ant Design 表格包装层或预期的虚拟滚动裁切，没有发现订单详情被遮挡，也未增加忽略规则。桌面 1280px 固定列可用；390px 下关闭固定列并由表格内部横向滚动。Chromium 与 Edge 的 Table 专项各 4/4 通过，粗指针关闭按钮为 64×44px；检查期间没有浏览器健康错误。
- **技术评分：** 无障碍 3/4（语义关系与焦点行为有自动化证据，真实读屏未测）；性能 3/4（小型静态数据，无新增动画，未测设备帧率/INP）；主题 2/4（使用语义 token，未覆盖完整主题矩阵）；响应式 4/4（1280/930/390/320px、长文本和触控尺寸有验证）；实现完整性 4/4（保留公开 Ant Design API）。合计 **16/20，Good**，仅针对该 demo。
- **验证与代码复审：** 当前源文件与 Assessment B 验收时的 SHA-256 一致。主工作区 `npm run check` 通过 55 个测试文件、445 项；`npm run build:lib`、`npm run check:scaffold`、Prettier、ESLint 和 `git diff --check` 通过。隔离副本 `npm run build:docs` 及静态导出通过，共 158 个 HTML 页面、474 个本地 JS/CSS 引用和 88 个嵌套 demo 页面。独立代码复审 GO，本批没有未关闭的 P0/P1；详情键盘、窄屏和触控路径没有新的 P0-P2。
- **未覆盖范围：** Table 全风格/主题色/明暗/密度组合、200%/400% 缩放、真实读屏、Safari、实体触控、设备性能与部署环境仍待验收。本批不关闭 Table 全量矩阵或全库 2B-1。
- **Questions skipped:** 只有两个非阻断 P3 观察，且用户已授权继续执行路线图；没有需要暂停推进的产品决策。
