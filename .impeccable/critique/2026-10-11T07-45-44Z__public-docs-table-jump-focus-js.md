---
target: public/docs-table-jump-focus.js
total_score: 34
max_score: 40
na_heuristics:
p0_count: 0
p1_count: 0
target_identity: "file:F:\\work\\lz-ui\\public\\docs-table-jump-focus.js"
target_fingerprint: "sha256:8e9ff89c1506534b8f1d94d8c9d9e0495e5fbbf3e3b9853dc51fe7cfba80585d"
target_path: "F:\\work\\lz-ui\\public\\docs-table-jump-focus.js"
timestamp: 2026-10-11T07-45-44Z
slug: public-docs-table-jump-focus-js
closed: true
---
Method: dual-agent (A: /root/skip_link_ux_assessment · B: /root/input_skiplink_evidence)

# Input 文档跳转入口与延迟挂载评审

## Design Health Score

| # | 启发式 | 分数 | 依据 |
|---|---|---:|---|
| 1 | 系统状态可见性 | 4 | Tab、Enter 和焦点转移均有可见反馈。 |
| 2 | 系统与真实世界匹配 | 4 | 中文文案直接说明跳转目的。 |
| 3 | 用户控制与自由 | 3 | 保留原生链接行为和浏览器修饰键路径。 |
| 4 | 一致性与标准 | 3 | 使用原生链接、焦点样式和命名区域。 |
| 5 | 错误预防 | 3 | 缺链、延迟正文和路由换页均有兜底。 |
| 6 | 识别而非回忆 | 4 | 正文和 API 表均有明确名称与提示。 |
| 7 | 灵活性与效率 | 4 | 可跳过重复导航并直接到达 API 表。 |
| 8 | 美观与简约 | 3 | 300px 下入口文案需要换行，视觉尺寸偏小。 |
| 9 | 错误恢复 | 3 | 原生锚点提供基础回退，目标延迟时由观察器等待。 |
| 10 | 帮助与文档 | 3 | 跳转文案和窄屏滚动提示清楚。 |
| **合计** |  | **34/40** | **Good；无 P0-P2，保留一个 P3。** |

## 设计结论

跳转入口针对 lx-ui Dumi 文档的阅读路径，第一次正向 Tab 进入主要内容链接，Enter 后文章获得焦点并更新 hash，随后可到达 Input API 表。300px 下入口可辨认且没有与 Logo、搜索、菜单或标题重叠，但文字占用较紧凑，作为后续窄屏 polish 的 P3。

## 技术证据

- Impeccable 4.1.3 detector 对当前目标输出原始 stdout `[]`、退出码 0；这只代表确定性静态规则未命中，不代表视觉、读屏或真实设备通过。
- 浏览器回归在 Chromium、Microsoft Edge、Windows Playwright WebKit 共运行 45 项，44 项通过、1 项因 Windows WebKit `maxTouchPoints=0` 跳过。三引擎均通过分阶段加入 `main`、`article`、`h1` 的延迟挂载、缺链首次 Tab、焦点/Hash、API 表滚动和 browser-health 路径。
- 独立复审曾指出延迟节点一次性插入的测试覆盖不足；当前测试已改为三阶段插入，并断言无标题时 `aria-label`、标题出现后的 `aria-labelledby` 以及标题 ID 更新。
- 运行时指定的代理配置为 `gpt-6-luna max`，但实际可见标记只有 GPT-6，无法核验具体变体；因此本快照不把该代理称为已确认的 Luna Max，最终代码结论由主代理复核。

## Priority Issue

**[P3] 300px 跳转入口偏小。** 窄屏下链接限制宽度并换行，仍满足 44px 最小高度和键盘可达，但字号和可用宽度较紧。后续可在不遮挡 Dumi 导航的前提下按实际可用宽度调整字号或布局。

## 边界

未覆盖真实屏幕阅读器、200%/400% page zoom、Safari 实机、实体触控、强制颜色、设备性能和目标部署。8000/8001 Dumi 开发端口当前 Input 路由返回 404，本轮浏览器测试使用只读静态预览，并通过请求映射加载当前脚本源码；没有将共享 `docs-dist` 当作当前修改后的构建证据。

Questions skipped: 本轮没有新的产品行为问题；Escape 继续按既定 ADR 留到 2B-2。
