---
score: 33
p0: 0
p1: 0
assessment: A-B
version: 4.1.3
target_identity: "file:F:\\work\\lz-ui\\docs\\demos\\list.tsx"
target_fingerprint: "sha256:75b0043276d85fbc895693e3308ab34d3e0c998b3e096413983dbdbf2884d091"
target_path: "F:\\work\\lz-ui\\docs\\demos\\list.tsx"
timestamp: 2026-10-12T13-44-53Z
slug: docs-demos-list-tsx
---
# List 资金流水示例 UX 复核

目标：`docs/demos/list.tsx`。设计依据为 `UI/P0 基础组件-Data Display/code.html`，实际页面为 `http://127.0.0.1:8004/components/data-display/list/`。子代理配置为 `gpt-6-luna max`；运行时模型身份无法独立核验。

## Assessment A：独立设计评审

评审检查最新的 1280×900 桌面与 390×844 移动截图以及 List demo/CSS 源码，没有读取 Assessment B 的 detector 输出。产品特异性明确：银行账户、交易编号、收支/转账、状态、金额和时间围绕企业资金流水扫描组织；桌面保留主体与财务信息双栏，390px 下金额/时间分组落在记录主体之后并与标题文字列对齐。

Nielsen 10 项评分：系统状态可见性 4/4；符合真实世界 3/4；用户控制与自由 3/4；一致性与标准 4/4；错误预防 3/4；识别而非回忆 3/4；灵活与效率 2/4；简约与美感 4/4；错误识别与恢复 4/4；帮助与文档 3/4。总分 **33/40（Good）**。

认知负担方面，每条记录按主体与财务信息分组，加载为唯一突出的主操作，主题设置和状态演示默认折叠。情绪路径从克制的列表扫描开始，数量反馈和失败恢复为主要操作提供确定性。优点是窄屏金额/时间已对齐、桌面信息层级稳定、状态文案与重试恢复路径配合。

保留建议：P2，真实账目跨年或跨时区时显示必要的年份/业务时区上下文；P3，可评估显示低强调度的“收入 / 支出 / 转账”标记以提升快速扫描；继续保留“外汇审核”文字标签，不让颜色单独承担状态语义。Alex 可能需要未来业务列表/表格层提供筛选和批量操作；Sam 的真实读屏、对比度和放大行为尚未实测；Riley 需要关注时间语义边界。截图未覆盖 320px、满载、错误/空态、深色主题和键盘操作。

## Assessment B：detector 与浏览器证据

detector 唯一命令：`node C:\Users\Administrator\.codex\skills\impeccable\scripts\detect.mjs --json docs/demos/list.tsx`。原始 stdout 为 `[]`，stderr 为空，退出码 0；它只表示确定性规则未命中。

浏览器命令：`npm run test:browser:list:preview`。Windows Chromium 与 Windows Playwright WebKit 各 3/3，共 6/6。覆盖加载更多与焦点、加载/错误/空态恢复、reduced-motion、暗色/紧凑主题、API 参数区方向键滚动、browser-health，以及 1280×720、930×720、390×844、320×740 的根溢出。390px 和 320px 下逐项读取 21 条流水边界，验证财务分组位于身份信息后方、左缘与标题对齐、没有行内越界或金额/日期重叠。browser-health 未发现页面异常、console error、请求失败或 HTTP 4xx/5xx。

主代理另外查看隔离 Dumi 产物的 1280×900 与 390×844 全页截图：`.codex/list-preview-desktop.png`、`.codex/list-preview-mobile.png`。静态导出门禁通过，包含 161 个 HTML、644 个本地资源引用、89 个嵌套 demo 页面。测试使用 CSS viewport 仿真，不等于真实设备或 Apple Safari；未执行实体触控、200%/400% zoom、自动化可访问性扫描或真实屏幕阅读器检查。

## 综合结论

最新截图确认上轮金额/时间错位问题关闭。独立代码复审结论为 GO，未发现 P0–P3。局部 List demo 可以交付；跨年/跨时区数据语义、可见业务类型标记和完整主题矩阵仍作为后续范围，不据此宣称整个 List 组件或全库 2B-1 已完成。

Questions skipped: 用户已要求持续推进，当前没有需要阻塞本批的产品决策。
