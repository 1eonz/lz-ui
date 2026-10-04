---
total_score: 30
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 0
target_identity: "file:F:\\work\\lz-ui\\src\\components\\form\\input\\index.md"
target_fingerprint: "sha256:5221388a834535100609b35f780ae9d85b00083cd1f097e80ff9b9d84fbb4230"
target_path: "F:\\work\\lz-ui\\src\\components\\form\\input\\index.md"
timestamp: 2026-10-04T10-38-29Z
slug: src-components-form-input-index-md
closed: true
---
Method: dual-agent (A: /root/input_critique_a · B: /root/input_critique_b)

# Input 文档与 Dumi 页面评审

日期：2026-10-04。Impeccable 4.1.3，Read 模式。目标为 `src/components/form/input/index.md`、六个可运行 Input demo、共享 demo 容器和 Dumi 文档壳。A、B 使用 `gpt-6-luna` max 独立评审；A 未读取 detector 结果，B 未读取 A 的结论。此记录为修改前基线。

## 设计特异性与总体感受

内容以客户、合同、采购输入等 lx-ui 中后台场景组织，并明确 AntD 5 公开 API 与业务职责边界，内容有项目针对性。文档的整体视觉仍以 Dumi 默认结构为主，当前区分度主要来自示例和主题设置。真实 demo 可操作，API 覆盖充分；首屏静态代码占用较高，目录较长，读者要先读较多内容才能操作组件。

## Nielsen 启发式评分

| # | 启发式 | 分数 | 依据 |
|---|---|---:|---|
| 1 | 系统状态可见性 | 3 | demo 显示当前值、校验错误和主题状态。 |
| 2 | 系统与现实世界匹配 | 4 | 中文说明和客户、合同、采购字段符合目标使用场景。 |
| 3 | 用户控制与自由 | 3 | demo 可编辑、清除并通过目录跳转；长目录末尾需要单独滚动。 |
| 4 | 一致性与标准 | 3 | 结构、参数表和交互基于熟悉的 Dumi 与 AntD 公开 API 习惯。 |
| 5 | 错误预防 | 3 | label、受控模式、校验及金额精度边界均有说明。 |
| 6 | 识别而非记忆 | 3 | 标题和字段明确，但目录较长、类型引用未链接。 |
| 7 | 灵活性与效率 | 3 | 有目录、键盘替代操作和 ref 示例；API 表仍需连续扫读。 |
| 8 | 美观与简约 | 3 | 阅读层级清楚，但代码块、示例工具条及长表增加篇幅。 |
| 9 | 错误识别与恢复 | 3 | 错误 demo 给出格式建议并关联 `aria-describedby`。 |
| 10 | 帮助与文档 | 2 | 文档和可运行 demo 齐全；目录较长，审查记录入口没有链接。 |
| **总计** |  | **30/40** | **Good，75%** |

认知负荷为中等：主题设置默认折叠，章节和字段关系清楚；`Input 参数` 有 17 行，页面目录有 12 个锚点，桌面可见约 10 项，剩余项目在目录自身滚动区域内。情绪路径从明确用途和真实表单开始，经可运行 demo 建立信心，在长 API 表格处放慢，末尾以未链接的浏览器验收记录收尾。

## Detector 与浏览器证据

B 扫描 9 个 markup 文件：Input Markdown、六个 Input demo、清除图标和共享 demo frame。命令为：

```text
node "C:\Users\Administrator\.codex\skills\impeccable\scripts\detect.mjs" --json src/components/form/input/index.md docs/demos/input-basic.tsx docs/demos/input-size.tsx docs/demos/input-states.tsx docs/demos/input-affixes.tsx docs/demos/input-textarea.tsx docs/demos/input-ref.tsx docs/demos/input-clear-icon.tsx docs/demos/data-display-demo-frame.tsx
```

CLI 原始 JSON 为 `[]`，退出码 0，规则命中 0；未扫描 CSS。`[]` 仅表示确定性 CLI 规则没有命中，不代表 Impeccable 通过。

B 在新的 IAB 标签、1280×720 页面中确认目录可跳转，邮箱输入 `not-an-email` 并失焦后出现红色错误状态及“请填写完整邮箱，例如 name@example.com。”；警告、禁用、只读状态同时可见。注入 detector 的页面 overlay 成功：DOM 报告 30 个 overlay、29 个 label；console 摘要报告 30 项，按标签分组的条目相加为 31，存在计数差异。标签包括 `cramped-padding`、`line-length`、`ai-color-palette`、`low-contrast`、`em-dash-overuse` 和 `layout-transition`。页面无 console warning/error。子代理 IAB 不支持呈现浏览器窗口，因此不声称 overlay 对用户可见。

主代理另行检查 `8000` 当前页面：1280×720 时 `documentElement` 为 1265/1265，Input 目录长项按词换行；930×800 时页面宽度为 915、scrollWidth 为 922，搜索输入宽 280px 而其容器仅 205px，导致 7px 根级横向溢出；390×844 与 320×760 时根级宽度分别为 375/375 和 305/305，移动菜单收起后页面正常，代码块只在自身区域滚动。当前为暗色主题；页面 console warning/error 查询为空。主代理在 930px 实测发现不属于 B 的 viewport 控制尝试，也不将它算作 B 的检查范围。

## 优点与优先问题

- 客户、合同和采购示例让 API 约束落在真实后台工作中。
- 示例覆盖受控/非受控、尺寸、校验、前后缀、多行和 ref，并显示可观察结果。
- `allowClear` 使用字段专属中文名称，并说明宿主的语言责任。

1. **[P2] 目录锚点过多且末尾需要内部滚动。** 12 个同级锚点使章节选择列表偏长；应把示例与 API 内容分组，并合并事件、TextArea 参数或实例方法入口。
2. **[P2] 清除按钮不进入 Tab 顺序，其他可清除示例缺少就地键盘提示。** AntD 的清除按钮为 `tabIndex=-1`；基础 demo 有 Ctrl/Command+A 后删除的替代路径，前后缀和 TextArea demo 没有。
3. **[P2] 首屏只有长静态用法代码，没有可交互示例。** 1280×720 首屏停留在约 20 行 `tsx pure` 代码；压缩示例并让第一条 demo 进入首屏。
4. **[P2] 平板断点内搜索框超出文档可视宽度。** 930px 下内部 input 280px，外层仅 205px，页面向右溢出 7px 并可能挤压主题按钮；让 input 跟随收窄后的容器。
5. **[P3] 验收说明引用了未链接的项目审查记录。** 为 `项目审查记录` 增加 Dumi 文档路由链接。

## Persona 红旗与次要观察

- **Alex，熟练开发者：** 12 项同级目录与 17 行参数表增加 API 定位时间。
- **Jordan，初次使用者：** `AntD 5.24+`、`InputProps` 和 CSS Grid/Flex 默认读者已理解；`InputProps` 未链接。
- **Sam，键盘与辅助技术用户：** 输入标签及错误关联有说明；清除按钮不能通过 Tab 到达，替代按键目前只在基础示例旁出现。

页面更新时间显示 2026-10-01，但本地文件在 2026-10-04 有改动；看起来是提交时间，提交后应复核显示。主题设置默认折叠有助于保持阅读焦点。未检查读屏器、200%/400% 缩放、Safari/Edge、完整主题与密度矩阵、reduced motion 和真实触屏硬件。

Questions skipped: 用户已明确授权继续修复 P1/P2、使用 Impeccable 与独立复审，并自动提交推送；不重复询问修复方向。
