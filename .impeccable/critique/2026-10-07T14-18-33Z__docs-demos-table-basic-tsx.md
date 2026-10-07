---
target: Table基础示例的窄屏提示与键盘滚动
total_score: 29
max_score: 40
na_heuristics: ""
p0_count: 0
p1_count: 0
p2_count: 0
p3_count: 2
target_identity: "file:F:\\work\\lz-ui\\docs\\demos\\table-basic.tsx"
target_fingerprint: "sha256:c4cc0fe7af7378ce49ca2d0868a3b400650bd3b1fe5ecb612d1e7f6adcac319c"
target_path: "F:\\work\\lz-ui\\docs\\demos\\table-basic.tsx"
timestamp: 2026-10-07T14-18-33Z
slug: docs-demos-table-basic-tsx
closed: true
---
# Impeccable Critique：Table 基础示例的窄屏提示与键盘滚动

## 范围与方法

- 目标：`docs/demos/table-basic.tsx`；关联 `data-display-demo.module.css`、共享滚动区、Table 交互示例、Table 文档和浏览器/组件测试。模式为 Read，不改变组件公开 API。
- Impeccable 4.1.3；本会话对 `docs/demos/table-basic.tsx` 执行一次 `context.mjs`，确认这是沿用现有 ERP/采购后台视觉系统的窄范围修改。遵循 `audit`、`critique`、`polish` 与 craft floor。
- Assessment A 与 B 使用隔离的 `gpt-6-luna max` 子代理；A 先完成设计评审，B 随后执行 detector 与浏览器 overlay。另一个 `gpt-6-luna max` 子代理完成独立代码审查。

## 设计特异性与 Nielsen 评分

示例以采购单号、供应商和结算金额呈现 ERP 表格阅读任务。窄屏提示只在表格容器小于 480px 时出现，语言指出触控横向滚动和 Tab 后用左右方向键滚动；具名区域通过 `aria-describedby` 关联提示。界面仍沿用 lx-ui 的业务数据展示样式，没有增加通用宣传或装饰元素。

| #        | 启发式         |      分数 | 证据                                                                        |
| -------- | -------------- | --------: | --------------------------------------------------------------------------- |
| 1        | 系统状态可见   |       3/4 | 窄屏溢出提示在需要时出现，宽屏不显示；无异步状态。                          |
| 2        | 贴合现实世界   |       3/4 | 订单、供应商和结算金额与采购后台场景一致。                                  |
| 3        | 用户控制与自由 |       3/4 | Tab/Shift+Tab 可进入和离开具名滚动区，横移只在位置变化时消费按键。          |
| 4        | 一致性与标准   |       3/4 | 使用语义 region、原生键盘和可见焦点环，不替换浏览器或单元格操作。           |
| 5        | 错误预防       |       3/4 | 提示说明窄屏横移；方向键边界、修饰键和子控件按键均保留默认行为。            |
| 6        | 识别而非回忆   |       2/4 | 用户能看到具名区域和窄屏提示；宽屏下约需 41 次 Tab 才能从文档起点到达该区。 |
| 7        | 灵活性与效率   |       3/4 | 触控横移与键盘 80px 步进均可用；宽屏无溢出时滚动键无效。                    |
| 8        | 美学与简约     |       3/4 | 提示只在内容溢出时显示，复用现有文档样式和 token。                          |
| 9        | 错误恢复       |       3/4 | 静态只读表格没有提交或破坏性操作；滚动边界不吞掉浏览器默认行为。            |
| 10       | 帮助与文档     |       3/4 | 短提示和 Table 文档写明键盘路径及边界。                                     |
| **合计** |                | **29/40** | **Good；初评值，不代表组件库整体评分。**                                    |

## 认知负荷与主要风险

屏幕只新增一条条件提示，不添加额外控制。窄屏用户可用触控或区域键盘入口查看完整列；键盘用户无需猜测滚动方式。A 组确认 320px 下滚动区宽约 190px，首屏可见列有限，但表格内容完整可达；主要空间来自 Dumi 外框与 `.surface` 内距，滚动区自身没有额外 padding。该项由 P2 降为不阻断的 P3。1280/930px 没有横向溢出仍保留一个具名 region Tab 停靠点，左右键不滚动；保留为 P3 观察，避免仅凭当前宽度移除停靠点而破坏布局重排/缩放后的路径。约 41 次 Tab 的观察属于 Dumi 文档壳范围，不在本批扩大修改。

## 问题及处理

- **[P2，已关闭] 键盘滚动路径未告知。** 基础示例提示补充 Tab 与左右方向键说明，并通过浏览器验证 `aria-describedby`、真实 Shift+Tab/Tab 往返和 80px 横移。
- **[P3，记录] 320px 可见表格宽度较小。** 约 190px 可视宽度增加横移次数，但页面无横向溢出、全部列可达；外层空间调整应单独评估 Dumi 演示容器的全站影响。
- **[P3，记录] 宽屏存在无效方向键停靠点。** 现阶段具名 region 是稳定的键盘入口；若未来移除，需要针对容器查询、200%/400% zoom 与布局变化设计动态焦点策略。
- 独立 code review 指出原提示 CSS 的 479px 断点与 480px 表格最小宽度之间存在小数宽度空隙。已改为 `inline-size < 480px`，并增加 479.5px 显示、480px 隐藏的浏览器断言；修复后复审 GO。

## 技术审计

| 维度       |      分数 | 证据与限制                                                                        |
| ---------- | --------: | --------------------------------------------------------------------------------- |
| 无障碍     |       3/4 | `region`、名称、条件描述、焦点环和键盘路径有浏览器证据；未做真实读屏或 axe 检查。 |
| 性能       |       3/4 | 无新增依赖，键盘处理为单次滚动读取/写入；未测真实设备性能或 Core Web Vitals。     |
| 主题       |       3/4 | 提示复用语义文字 token 和主题 Provider；本批没有逐一截图全部外观/色板。           |
| 响应式     |       3/4 | Chromium/Edge 320/390/1280px 无根横向溢出；窄屏只有约 190px 可视表格宽度。        |
| 实现完整性 |       4/4 | `useId` 描述关联、共享文档滚动区、真实浏览器边界断言，无 AntD 私有 DOM 依赖。     |
| **合计**   | **16/20** | **Good；只评估本批示例和交互范围。**                                              |

## Assessment B 与浏览器证据

- Impeccable detector 扫描 `table-basic.tsx`、`table-demo-scroll-region.tsx`、`table.tsx`，原始 stdout 为 `[]`、stderr 为空、退出码 0。它只表示 TSX 确定性规则未命中，不扫描 CSS Module，也不代表视觉验收。
- Overlay 注入成功，命中 2 项 `cramped-padding`、4 项 `text-occlusion`、1 项 `layout-transition`。4 项遮挡针对默认折叠的主题设置内容，属于折叠状态误报；间距和过渡命中来自 Dumi/共享文档壳。overlay 注入本身使 html `scrollWidth` 从 390px 变为 498px，因此不将其滚动宽度当作页面缺陷。
- A 组 Chromium 实测 390/320px 分别约 260/190px 的 region 宽度，提示可见且与 region 描述关联；键盘实际 Shift+Tab 回到主题设置，再 Tab 回到 region，ArrowRight 将 `scrollLeft` 从 0 改为 80。宽视口提示隐藏。
- 完成最新 `build:docs` 后，`tests/browser/table-demo.spec.ts` 的完整 Chromium 和 Edge 套件各 **10/10** 通过。包含键盘起止边界、浏览器默认行为、Tab/Shift+Tab、子复选框按键透传、320/390px 提示、479.5/480px 断点、主题样式、固定列、粗指针和虚拟滚动；浏览器错误收集器无错误。
- B 的早先预览使用了旧 `docs-dist`，对 `<480px` 规则单独注入等价 CSS 验证断点。其后主代理从最终源码重建 `docs-dist`，并在 Chromium/Edge 对最终产物各跑完整 10 项，因此最终构建的断点与交互证据来自主代理全套测试。

## 独立复审与工程门禁

- 独立 `gpt-6-luna max` 代码审查两轮均为 **GO**；断点返工复审没有 P0–P2。
- `npm run check` 通过 Prettier、TypeScript、103 个 Dumi demo 类型检查、ESLint 和 **55 个测试文件/606 项测试**。`npm run check:scaffold`、`npm run build:lib`、`npm run build:docs` 均通过；静态导出包含 158 个 HTML、474 个本地 JS/CSS 引用和 88 个嵌套 demo。
- 仍未覆盖真实屏幕阅读器、真实实体触控、200%/400% page zoom、设备性能和目标部署。CSS viewport 结果不等价于真实浏览器页面缩放；本批不关闭全库 2B-1。

Questions skipped: 用户已授权沿路线图持续完成，本批未发现需要改变产品方向的阻断决策；未关闭项为两个 P3 观察。
