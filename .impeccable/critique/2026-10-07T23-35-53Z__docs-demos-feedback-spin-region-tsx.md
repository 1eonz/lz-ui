---
target: Spin 区域加载与失败恢复 demo
total_score: 38
max_score: 40
p0_count: 0
p1_count: 0
target_identity: "file:F:\\work\\lz-ui\\docs\\demos\\feedback-spin-region.tsx"
target_fingerprint: "sha256:050ab761f9117f6a0c0559ae498055571258ed3bc656df12a5a962fc8ffa0350"
target_path: "F:\\work\\lz-ui\\docs\\demos\\feedback-spin-region.tsx"
timestamp: 2026-10-07T23-35-53Z
slug: docs-demos-feedback-spin-region-tsx
---
Method: dual-agent (A: /root/spin_ux_final · B: /root/spin_fix_batch)

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---:|---|
| 1 | 系统状态可见性 | 4/4 | loading、失败和成功状态都清楚。 |
| 2 | 贴近真实任务 | 4/4 | 地区同步和客户数据符合后台业务语境。 |
| 3 | 用户控制与自由 | 4/4 | 筛选仍可编辑，加载中保留焦点，失败后可重试。 |
| 4 | 一致性与标准 | 4/4 | 按钮状态、Spin 遮罩和 status 分工明确。 |
| 5 | 错误预防 | 4/4 | loading 时同步请求锁阻止重复提交。 |
| 6 | 识别而非记忆 | 4/4 | 地区、加载状态和失败后的保留行为可见。 |
| 7 | 灵活性与效率 | 3/4 | 有键盘和鼠标路径，演示未提供真实数据筛选快捷操作。 |
| 8 | 简约与审美 | 3/4 | 视觉层级清楚，加载文案存在轻微重复。 |
| 9 | 错误诊断与恢复 | 4/4 | 失败后保留筛选和内容，并提供直接重试。 |
| 10 | 帮助和文档 | 4/4 | Spin 文档说明状态、延迟、动效和职责边界。 |
| **总分** |  | **38/40（Good）** | 评分只适用于本次 Spin demo。 |

## Design Specificity Verdict

设计特异性高。地区输入、客户数据刷新、失败保留和重试成功均对应 CRM 后台任务，不是可直接替换到无关产品的通用空壳。页面仍是组件示例，不模拟完整客户筛选或生产请求。

Assessment A 在 1280×900 和 390×844 新浏览器上下文检查最新 Dumi 页面。页面返回 HTTP 200；桌面 loading 的 spinner 和 tip 不遮挡地区输入；390px 下 document 与 body 均无水平溢出。Assessment B 在 8006 的新上下文检查 loading 按钮的 rest、hover、mouse-down 三态：背景 `rgb(243, 248, 254)`、文字 `rgb(97, 107, 120)`、边框 `rgb(114, 119, 134)` 均与各自主题 token 的计算值相同，按钮保留 `aria-disabled="true"` 和 `cursor: wait`。

Detector 命令为 `node C:/Users/Administrator/.codex/skills/impeccable/scripts/detect.mjs --json docs/demos/feedback-spin-region.tsx`，stdout 原样为 `[]`，stderr 为空，退出码 0。它只表示扫描的 TSX 未命中确定性规则；不会扫描 CSS Module，也不能代替实际 DOM、视觉或读屏检查。本轮没有注入 overlay。

## Overall Impression

状态反馈完整，失败时保留数据和筛选的说明让后台用户知道当前输入没有丢失。首次独立代码审查发现 AntD hover 规则覆盖忙碌按钮颜色；样式提升优先级并加入 rest、hover、pressed 自动断言后，第二轮代码复审为 GO。没有遗留可操作 P0-P2。

## What's Working

- 地区筛选留在遮罩外，加载时仍可查看和编辑；`aria-busy` 只标记客户数据区。
- loading 通过 `aria-disabled` 保留焦点，重复鼠标/键盘激活不重启请求；首次失败后的一次重试成功。
- 触屏模拟下主要同步操作达到 44px，reduced-motion 下默认和自定义指示器停止动画。

## Priority Issues

- **P0-P2：无遗留问题。**
- **P3：** tip“正在同步客户…”，status“同步中”和按钮“正在同步…”同时显示，存在轻微重复。保留 status 的辅助技术播报语义，后续可确定一个主要可见状态。
- **P3：** 用户把地区输入从“华东”改为“华南”时，演示仍显示上海客户；该输入目前演示的是加载期间保留筛选，不实际过滤数据。可在后续明确它是同步参数，或让示例记录随地区变化。
- **P3：** 成功状态显示 28 位客户，而页面只展示一条示例记录且最近同步时间固定。可在后续让示例数据的总量和同步时间保持一致。
- **P3：** 失败示例没有提供失败原因；固定失败的组件演示可以接受，真实业务需给出用户可理解的原因或下一步。

## Persona Red Flags

- CRM 操作员将地区改成华南后仍看到上海记录，可能误认为筛选已经生效。
- 使用屏幕阅读器的人可能听到按钮名称变化和 `role="status"` 两次状态反馈；tip 已 `aria-hidden`，真实读屏尚未验证。
- 遇到真实同步故障的人只看到失败和重试入口，无法判断是否要稍后重试或处理权限问题。

## Minor Observations

加载中筛选保持可编辑符合当前演示意图；失败后状态区域与按钮提供清晰恢复路径。示例固定使用一个客户和本地计时器，应理解为 Spin 状态演示，不代表生产数据流。

## Questions to Consider

- 地区输入要表达“请求参数”，还是实际筛选结果？
- loading 时 tip、status、按钮名称中哪一个应作为主要可见状态？
- 生产请求失败后，接口能提供哪些可恢复原因？
