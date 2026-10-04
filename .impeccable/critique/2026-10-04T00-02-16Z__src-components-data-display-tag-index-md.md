---
target: Tag 标签文档与 Data Display 表格滚动体验
total_score: 35
max_score: 40
na_heuristics:
p0_count: 0
p1_count: 0
p2_count: 1
target_identity: "file:F:\\work\\lz-ui\\src\\components\\data-display\\tag\\index.md"
target_fingerprint: "sha256:0adca2535b7959e2737d04299bbba203406aca40c690f8c71df58fb991ffafaa"
target_path: "F:\\work\\lz-ui\\src\\components\\data-display\\tag\\index.md"
timestamp: 2026-10-04T00-02-16Z
slug: src-components-data-display-tag-index-md
---

Method: dual-agent (A: /root/tag_ux_review_luna · B: /root/tag_final_tech_review)

## Assessment A：设计评审

Assessment A 独立读取 Tag 源码、Dumi 文档和 Stitch Data Display 设计稿，没有读取检测器或 B 组结论。A 子代理环境无法取得浏览器画面；页面实际视觉与交互由 B 组和主代理单独核验。

### 设计特异性与认知负荷

页面使用 ERP 模块、SLA、VIP 供应商、状态标签和受控业务分类，内容直接对应 PC 中后台开发者和 Stitch 的 Tag 方向。8 项认知负荷检查中，有 2 项选择数量关注：主题面板内标准主题色和东方配色选项较多；面板默认折叠，且两个选择器分开，不阻断组件使用。

### Nielsen 启发式评分

| #        | 启发式         |      分数 | 依据                                                     |
| -------- | -------------- | --------: | -------------------------------------------------------- |
| 1        | 系统状态可见   |         3 | 筛选、移除、恢复均显示状态结果。                         |
| 2        | 符合真实世界   |         4 | ERP、SLA、供应商与状态语义具体。                         |
| 3        | 用户控制与自由 |         4 | 支持切换、移除、取消关闭和恢复。                         |
| 4        | 一致性与标准   |         4 | 文档表格共享可聚焦滚动区域、键盘提示和语义名称。         |
| 5        | 错误预防       |         3 | 原生禁用和原因说明清楚；自定义关闭图标的语义由宿主负责。 |
| 6        | 识别而非记忆   |         4 | 属性列固定，各表具名，主表说明其固定列。                 |
| 7        | 灵活与效率     |         3 | 支持指针、键盘和触屏；完整浏览器矩阵未覆盖。             |
| 8        | 简洁与美观     |         3 | 内容按主题分组，窄屏与暗色截图仍需补证。                 |
| 9        | 错误识别与恢复 |         3 | 标签可恢复，操作结果有 live region。                     |
| 10       | 帮助与文档     |         4 | API、键盘、本地化及自定义关闭责任有说明。                |
| **总计** |                | **35/40** | **Good**                                                 |

### 情绪旅程和优点

开发者可从页面标题和基础示例理解 Tag/CheckableTag 的差异，再通过可运行示例观察筛选、移除、恢复和禁用状态；进入密集 API 表后，sticky 属性列帮助保持阅读上下文。

- 业务场景和状态文案具体，不是与组件无关的占位示例。
- 主 API 表固定属性列、允许类型折行，且可聚焦并在窄屏内横向滚动。
- 禁用控件的原因与控件关联；自定义关闭图标责任和本地化覆盖方式有公开文档。

### 优先问题

1. **P2，已关闭：** 方向键说明曾可能与真实滚动不符。B 组在 390px 实测普通 ArrowRight 后横移约 40px、ArrowLeft 反向移回约 40px，属性列保持 sticky；文案与浏览器原生 overflow 行为一致。
2. **P2，列入 6A：** 默认关闭名称为中文。非中文宿主需逐项通过 `closable['aria-label']` 提供本地化名称；文档有示例且测试覆盖。此边界不阻塞中文首版，但统一 Provider locale 接入和多语言读屏验证应在开放多语言发布前完成。
3. **P3，非阻塞：** 主题选择器选项较多。折叠默认和分组选择降低了对组件主流程的影响，本批不改变主题结构。

页面正文 H1、禁用原因说明均已存在；禁用状态保持原生语义。A 组本轮无法独立实测这些元素的实际页面渲染。

### Persona 风险与次要观察

- 熟悉组件库的开发者依赖键盘浏览；本批实测已确认方向键提示与表格滚动行为一致。
- 使用辅助技术的开发者依赖明确的关闭名称；非中文宿主漏传实例 `aria-label` 时仍会听到中文名称。
- 窄屏使用者需要在固定属性列之外横向阅读其他列；高倍缩放和读屏器未实测。
- 暗色 sticky 单元格颜色基于主题 token 映射，需在完整主题矩阵中继续核对。

启发性问题：统一 locale 配置应归属 LxConfigProvider，还是保留逐项 ARIA 名称？首个正式多语言版本是否要把真实读屏器输出作为 release gate？这两项留到 6A 架构评审。

## Assessment B：检测器、技术审计与浏览器证据

Slug 由 `critique-storage.mjs slug src/components/data-display/tag/index.md` 解析为 `src-components-data-display-tag-index-md`。`.impeccable/critique/ignore.md` 不存在。

检测命令：

```text
node C:\Users\Administrator\.codex\skills\impeccable\scripts\detect.mjs --json src/components/data-display/tag/index.tsx docs/demos/tag.tsx src/components/data-display/tag/index.md
```

原始标准输出为 `[]`，退出码 0，共扫描 3 个 markup 文件；CSS 不在本命令范围内。这只表示确定性规则没有命中，不能作为 Impeccable 通过证明。

| 技术维度   |      分数 | 依据                                                                                        |
| ---------- | --------: | ------------------------------------------------------------------------------------------- |
| 无障碍     |       3/4 | 表格 region、名称、辅助说明、焦点和禁用原因关系已核验；屏幕阅读器及多语言默认名称仍有限制。 |
| 性能       |       4/4 | 无新增依赖；关闭动作一次读取动效 token，计时器会在卸载时清理。                              |
| 主题       |       4/4 | 浅/深固定列与表头使用文档主题变量，主题切换后颜色同步变化。                                 |
| 响应式     |       4/4 | 320/390/930/1280px 页面根节点无横向溢出；表格自行滚动且属性列 sticky。                      |
| 实现完整性 |       3/4 | 可运行 demo、API 文档、测试和恢复路径齐全；全主题、高倍缩放与读屏矩阵待验。                 |
| **总计**   | **18/20** | **仅覆盖本目标及已检查状态。**                                                              |

浏览器页面为 `http://localhost:8001/components/data-display/tag#api`。主 API 表区域可聚焦，方向键滚动约 40px，属性列保持可见。320、390、930、1280px 的页面根节点均无水平溢出。AX 树显示唯一正文 H1“Tag 标签”；四个表格 region 的 `aria-describedby` 均指向唯一有效文本节点，只有主 API 表额外读取 sticky 属性列说明。关闭标签后在 120ms 动效结束时恢复焦点；若用户已主动移焦则保留其焦点。禁用标签和筛选均有可读原因。浅色固定单元格/表头为 `#f7f9fb` / `#fbfcfd`，暗色为 `#050709` / `#020305`。主题设置默认折叠；console 无新增 warning/error。

技术复审未发现 P0/P1/P2 代码阻塞。低优先级维护风险：共享滚动 CSS 针对当前 Dumi 生成的 `.dumi-default-table-content` 包装层，升级 Dumi 时需重验；选择器只作用于 `.lx-docs-table`，当前路由矩阵未发现回归。

## 综合结论与范围

本批已关闭方向键说明、正文 H1、禁用原因说明和表格说明关联问题。默认中文关闭名的集中式 locale 方案作为 6A 国际化设计项保留，非中文宿主当前可逐项传入 `aria-label`。P3 主题选择密度不阻断首版。

未覆盖：屏幕阅读器真实播报、200%/400% 缩放、Safari/Edge、全部 13 套配色与三种外观、正常退出动画逐帧、真实粗指针设备和 React 19 消费验证。2B-1 全组件浏览器矩阵仍在进行。

Questions skipped: 用户已明确继续既定路线图；locale 接入作为 6A 决策记录，不阻塞本批交付。
