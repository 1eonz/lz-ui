---
target_identity: "file:F:\\work\\lz-ui\\src\\components\\data-display\\badge\\index.md"
target_fingerprint: "sha256:49525499536545a8908b6cd0637f5315152f68cd518d2eec9c13f4f787d23dde"
target_path: "F:\\work\\lz-ui\\src\\components\\data-display\\badge\\index.md"
timestamp: 2026-10-12T01-28-20Z
slug: src-components-data-display-badge-index-md
---
# Badge 终审

## 目标与方法

- 目标：`src/components/data-display/badge/index.md` 及其 Badge demo，设计依据为 `UI/P0 基础组件-Data Display/screen.png` 和 `code.html`。
- Impeccable 版本：4.1.3。文档按 Read 审查，交互示例按 Operate 审查；检测器原始 stdout `[]`，只表示确定性规则没有命中。
- 评审来源：独立 UX 终审与独立代码复审；两个代理按 `gpt-6-luna max` 配置。运行时模型身份不可由当前工具独立核验，故只记录配置。

## UX 评分

Nielsen 十项评分：`9, 9, 9, 9, 8, 9, 9, 8, 9, 9`，合计 **88/100**。原始客户 Ribbon 卡片仍符合设计稿；起始侧 Ribbon 作为额外 API 和 RTL 示例，使用独立卡片，不改变原始构图。第二次源码/CSS/spec 复核确认评分不变，未发现新 P0-P3。

## 问题与关闭

- 组件实例提供 `styles.indicator.backgroundImage` 时，旧实现会额外注入 `backgroundColor: currentColor`，透明渐变或 `none` 会透出错误底色。现仅图像背景的实例级样式使用透明底色；渐变和 `none` 均有单测与浏览器计算样式断言。
- ConfigProvider 的 `badge.styles.indicator` 遵守 AntD 公开样式合并顺序。需要纯图像背景时同时设置 `backgroundColor: 'transparent'`；该边界记录在 API 文档，并有 Provider 单测。
- `Ribbon placement="start"` 的 RTL 物理边缘缺少验证。浏览器用例已分别检查 LTR/RTL 下 start/end 的角度、物理边缘及角标是否保持在各自卡片内。
- 最终独立代码复审结论 **GO**，未发现 P0-P3。

## 浏览器证据

`tests/browser/badge-demo.spec.ts` 在 Chromium、Microsoft Edge、Windows Playwright WebKit 各通过 1/1。覆盖 1280/930/390/320px、主题色切换、dark/compact、reduced-motion、处理状态大小与周期、受控计数恢复、键盘滚动 API 表、触控仿真的 44px 目标，以及两种 Ribbon placement 的 LTR/RTL 几何。三个引擎 browser-health 均无页面错误、console error、失败请求或 HTTP 错误。

完整工程验收：56 个测试文件、639 项测试和 106 个 demo 类型检查通过；Dumi 导出 161 个 HTML 页面、644 个本地 JS/CSS 引用、89 个 demo；ESM/CJS 库构建成功。包 dry-run 为 522 个文件、压缩 171184 B、解包 784984 B。

## 未覆盖

真实屏幕阅读器、真实 200%/400% 页面缩放、Safari 实机、实体触控、操作系统级 reduced-motion、设备性能、生产部署和完整主题组合未验收。CSS viewport 和浏览器触控仿真不代表真实设备。
