---
total_score: 37
max_score: 40
p0_count: 0
p1_count: 0
p2_count: 0
target_identity: "file:F:\\work\\lz-ui\\public\\docs-table-jump-focus.js"
target_fingerprint: "sha256:f30806177ac48b605fd3e745f5d07be37cfbf6c8bca99cef0d1b61244e3b9452"
target_path: "F:\\work\\lz-ui\\public\\docs-table-jump-focus.js"
timestamp: 2026-10-11T08-44-42Z
slug: public-docs-table-jump-focus-js
---
# Input 文档跳转入口最终设计评审

## 评审范围

检查 Dumi 文档“跳至正文”入口的可见标签、键盘路径、窄屏布局、焦点反馈和延迟挂载。依据 `UI/DESIGN.md`、`docs/docs-shell.css`、`public/docs-table-jump-focus.js` 与 `tests/browser/input-demo.spec.ts`。这是文档阅读体验，不改变 lx-ui 的公开组件 API。

## Nielsen 启发式评分

| # | 启发式 | 分数 | 依据 |
|---|---|---:|---|
| 1 | 系统状态可见性 | 4 | 键盘聚焦时显示入口和焦点环，激活后正文标题获得焦点。 |
| 2 | 系统与真实世界匹配 | 4 | 中文短标签明确表达跳转正文；链接保留原生锚点语义。 |
| 3 | 用户控制与自由 | 4 | 保留浏览器原生链接行为和修饰键激活。 |
| 4 | 一致性与标准 | 4 | 使用标准跳过链接、键盘焦点和正文命名模式。 |
| 5 | 错误预防 | 4 | 入口优先进入 body 顺序，窄屏测试验证不遮挡相邻导航。 |
| 6 | 识别而非回忆 | 3 | Tab 后可见入口；鼠标用户不会看到键盘专用入口。 |
| 7 | 灵活性与效率 | 4 | 一个 Tab 到达入口，激活后焦点直接进入文章。 |
| 8 | 美观与简约 | 4 | 300px 下 56px 短标签保持单行且有清晰焦点样式。 |
| 9 | 错误恢复 | 3 | 正文延迟挂载可恢复；脚本整体加载失败时没有静态链接兜底。 |
| 10 | 帮助与文档 | 3 | 目标由可见标签和无障碍名称表达；链接不增加额外上下文说明。 |
| **合计** |  | **37/40** | **Excellent；无当前 P0-P2。** |

## 发现与关闭情况

首轮发现的 P3 是可见短标签只在 319px 以下验证；320px 与桌面用例虽然使用可访问名称定位，但未直接约束显示文案。现已将“跳至正文”和“跳至正文，跳转到主要内容”断言应用到 300px、320px、1280px 三个视口。复审确认该覆盖缺口关闭。另一个未覆盖边界是 390px 专属几何；当前不构成可复现缺陷，继续列入视口矩阵。

代码复审确认 Label-in-Name、首次 Tab 缺链同步补建以及 300px 几何断言没有发现当前代码缺陷。此前 34/40 快照中的“300px 文案换行”是短文案修复前的基线，不适用于本次实现。

## 浏览器证据

最终的 `tests/browser/input-demo.spec.ts` 在 Chromium、Microsoft Edge 和 Windows Playwright WebKit 各执行 15 项，共 45 项；44 项通过、1 项因 WebKit `navigator.maxTouchPoints=0` 跳过。新标签断言后的 Chromium 和 Edge 均为 15/15；WebKit 为 14 项通过、1 项跳过。覆盖 300/320/1280px 文案、300px 几何、首次 Tab、缺链同步事件、锚点和焦点交接。WebKit 跳过不代表实体触控验收。

Impeccable 4.1.3 detector 扫描原始 stdout 为 `[]`、stderr 为空、退出码 0；该结果只说明确定性静态规则未命中。子代理按 `gpt-6-luna max` 参数配置，但运行时身份无法核验，故只记录配置，不将它描述为身份确认。

## 未覆盖范围

未验证 390px 跳转链接专属几何、真实屏幕阅读器、200%/400% page zoom、Safari 实机、实体触控、强制颜色、设备性能和目标部署。浏览器用例使用现有 `docs-dist` 的 Vite preview，并映射当前脚本及注入当前样式；它不证明新 Dumi 构建资产已验收。
