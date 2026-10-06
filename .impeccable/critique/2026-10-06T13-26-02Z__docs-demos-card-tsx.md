---
target: Card responsive docs demo
total_score: 33
max_score: 40
p0_count: 0
p1_count: 0
p2_count: 0
p3_count: 0
target_identity: "file:F:\\work\\lz-ui\\docs\\demos\\card.tsx"
target_fingerprint: "sha256:b2c25ac24f18bd35f0bd5ab598dffbe386ee21320c11a4392b9faab9b54088a4"
target_path: "F:\\work\\lz-ui\\docs\\demos\\card.tsx"
timestamp: 2026-10-06T13-26-02Z
slug: docs-demos-card-tsx
---
Method: dual-agent (A: isolated Card design review · B: isolated detector and browser evidence)

## 范围与证据

- Impeccable 4.1.3；在本次会话以 `context.mjs --target docs/demos/card.tsx` 初始化，遵循 Read 模式、`critique`、`audit` 与 `craft-floor` 流程。
- 目标只包括 `docs/demos/card.tsx`、`docs/demos/card.module.css` 和 Card Dumi 路由；不涉及发布组件 API。
- Assessment A 由独立 `gpt-6-luna max` 子代理先完成；Assessment B 使用另一个隔离的 `gpt-6-luna max` 子代理，随后运行 CLI detector、注入浏览器 overlay，并用新建 Chromium 上下文实测。
- 页面设计特异性中高：采购运营、供应链风险、外部审计内容让示例适配 ERP/CRM 中后台；文档外壳本身仍较通用。

## Nielsen 启发式评分

| # | 启发式 | 分数 | 关键证据 |
|---|---|---:|---|
| 1 | 系统状态可见 | 4/4 | 加载骨架与 status 文案出现，完成后内容恢复。 |
| 2 | 贴合现实世界 | 4/4 | 标签与指标使用采购、供应链和审计语境。 |
| 3 | 用户控制与自由 | 3/4 | 可切换标签并完成加载恢复；示例无破坏性操作。 |
| 4 | 一致性与标准 | 3/4 | 使用标准 tabs 和按钮交互，窄屏标签缩写可读。 |
| 5 | 错误预防 | 3/4 | 选择项数量固定且少，交互不依赖自由输入。 |
| 6 | 识别而非回忆 | 4/4 | 三个标签始终完整显示，激活态可辨。 |
| 7 | 灵活性与效率 | 3/4 | 鼠标与方向键、Enter、Space 可操作。 |
| 8 | 美学与简约 | 3/4 | 层级清楚、组件与预览对齐，窄屏信息仍紧凑。 |
| 9 | 错误恢复 | 3/4 | 加载可恢复并返回触发按钮焦点；不模拟网络失败。 |
| 10 | 帮助与文档 | 3/4 | 组件 API 与受控用法有文档说明。 |
| **合计** |  | **33/40** | **Good** |

## 认知负荷与情绪路径

- 主要 demo 同时展示三个业务标签和两个加载动作，主题设置折叠，决策数量低；活动标签和指标变化即时可见。
- 九档视口中，Card 在窄屏保留短标签并在空间充足时显示全称。加载开始有反馈，结束可恢复内容与焦点。
- 完整 Dumi 导航有多项同级组件和章节链接，但目标组件查找清楚；它是文档外壳范围，不归为 Card 缺陷。

## 优点与 Persona 风险

- 优点：ERP/CRM 业务文案具体；卡片在 320–1280px 与预览框对齐；短标签与全称都能完整呈现；加载和恢复路径可操作。
- 新接入组件的开发者可以直接操作标签与加载按钮，并在组件文档查阅用法。
- 键盘用户可用标准 tabs 方向键移动和 Enter/Space 激活；真实屏幕阅读器与焦点对比尚未测试。
- 移动用户在 320px 可读到三项短标签；页面根节点没有横向溢出。

## Findings

- **[P2，已关闭] 测试未能证明 tab 文本没有被内部容器裁切。** 首次 code review 指出旧断言只比较外层 `tablist`，且逐项测量与点击交错。修复后的浏览器断言只为精确匹配标签的文本节点建立 Range，从节点父级检查所有 overflow 裁切祖先和 viewport，并在点击前先完成全部标签几何检查。第二轮独立 code review 为 GO；Chromium Card 规格 1/1 通过。
- 没有未解决的 P0–P2 设计问题。

## 技术审计

| 维度 | 分数 | 证据与限制 |
|---|---:|---|
| 无障碍 | 3/4 | tabs 有语义名称与键盘行为，状态使用 status；未运行 axe 或真实读屏。 |
| 性能 | 3/4 | 三个 tabs、无新增依赖；indicator 过渡无可见周边 reflow，未测真实设备性能。 |
| 主题 | 2/4 | 仅默认视图，未检查所有主题和密度。 |
| 响应式 | 4/4 | 320–1280px 根节点和目标文字范围均未溢出；断点两侧完整显示。 |
| 实现完整性 | 3/4 | 真实示例和交互有浏览器证据；跨浏览器和完整主题矩阵未覆盖。 |
| **合计** | **15/20** | **Good；只代表本目标。** |

## Assessment B：Detector 与浏览器

- CLI 命令：`node C:\Users\Administrator\.codex\skills\impeccable\scripts\detect.mjs --json F:\work\lz-ui\docs\demos\card.tsx`；退出码 0，原始输出 `[]`，0 项规则、finding 和位置。该命令对单文件 TSX 使用 regex 文本引擎，不跟随 CSS Module；不能判断页面渲染、裁切或交互。
- 浏览器注入成功。整页 overlay 有 11 组命中：`cramped-padding` 3、`line-length` 6、`layout-transition` 2。10 组位于 Dumi TOC、其他示例 Select、文档段落或 body；目标 demo 的一项是 AntD `.ant-tabs-ink-bar` 绝对定位指示条的宽度/位置过渡。body 的 `transition: padding` 不属于 Card demo。
- 320、390、930、1280px 下 document/body 无水平溢出。Card 分别为 190、260、520、870px；文本 Range 边界均在 `.ant-tabs-nav-wrap` 与 viewport 内。320px 标签为“采购 / 供应链 / 审计”；390px 以上为完整名称。三项标签逐项激活后面板内容均匹配。
- 390px 下点击加载显示骨架并播报“运营指标加载中”；完成后恢复指标，焦点回到“显示加载”。页面没有 console/page 错误。
- `.ant-tabs-ink-bar` 的正常 transition 是 `width, left, right`，时长 0.18s；指示条平滑移动，不改变周边布局，Layout Shift 约 1e-6。`prefers-reduced-motion: reduce` 下 computed duration/delay 为 0s，没有 transition 事件。
- 本批没有保存截图；上述页面、尺寸、交互和文本几何值提供了可重复路径和浏览器证据。浏览器结果来自独立 Headless Chromium 上下文；overlay 没有留在用户可见标签中。

## 未覆盖与结论

- 未覆盖 Edge、WebKit/Safari、真实读屏、实体触控、200%/400% 缩放、主题/外观/色板/密度组合和部署服务器；不关闭全库 2B-1。
- 该批修复关闭 Card tab 文本裁切和对应测试有效性问题；没有需要新增忽略规则的 detector 命中。

Questions skipped: 当前工作按已授权路线只闭合 Card 响应式标签和测试断言，没有待定的产品方向。
