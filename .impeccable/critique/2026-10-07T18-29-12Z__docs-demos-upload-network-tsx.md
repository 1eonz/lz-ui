---
target: Upload 宿主网络传输示例与文档
total_score: 34
max_score: 40
p0_count: 0
p1_count: 0
p2_count: 0
p3_count: 2
na_heuristics: 0
method: "dual-agent (A: UX review; B: technical/browser review)"
target_identity: "file:F:\\work\\lz-ui\\docs\\demos\\upload-network.tsx"
target_fingerprint: "sha256:c74c37ad47bc77a8ca934e337049030d121e1912e76787dd11cb7ed149406c98"
target_path: "F:\\work\\lz-ui\\docs\\demos\\upload-network.tsx"
timestamp: 2026-10-07T18-29-12Z
slug: docs-demos-upload-network-tsx
---
## Assessment A：独立设计评审

评审目标为 Upload 网络传输文档示例，使用 Read 模式；沿用 `UI/P0 基础组件-Form/DESIGN.md` 与 `code.html` 的拖放区、呼吸上传图标和文件生命周期卡片方向。

| 启发式 | 评分 | 依据 |
| --- | ---: | --- |
| 系统状态可见 | 4/4 | 本地暂存、进度、阶段计数、成功 fileId、错误与重试均有反馈。 |
| 符合真实世界 | 3/4 | 选择、拖放、上传和删除用语直观；multipart 与 fileId 面向组件开发者。 |
| 用户控制与自由 | 3/4 | 网络默认关闭，可单独上传、重试、取消上传和移除；远端删除没有二次确认。 |
| 一致性与标准 | 4/4 | 使用按钮、复选框、拖放区和主题设置等熟悉模式，键盘与指针入口一致。 |
| 错误预防 | 3/4 | 无效地址阻止请求，fileId 有安全约束；文件大小仍需后端校验。 |
| 识别而非记忆 | 4/4 | 地址、开关、文件状态和当前操作都显示在同一区域。 |
| 灵活与高效 | 3/4 | 支持拖放、按钮、键盘选择与重试，没有批量管理。 |
| 美观与简约 | 3/4 | 上传区是视觉焦点，配置与状态有分组；窄屏契约说明占据较多空间。 |
| 错误识别与恢复 | 4/4 | 失败保留文件和远端记录，提供重试；地址修正后清除过期错误。 |
| 帮助与文档 | 3/4 | API、事件、Form 集成和安全边界完整，文档信息密度较高。 |
| **合计** | **34/40** | **Good；无 P0、P1、P2。** |

认知负荷整体低；默认折叠主题设置，避免分散上传任务。折叠区中的 6 个品牌色选项和 8 个东方配色选择项（含“使用品牌色”）超过单次选择的 4 项建议，记作一项认知负荷观察。Dragger 实测只有一层 `1px dashed` 边框，外层 wrapper 无边框。键盘 Enter 打开 Playwright filechooser、选择文件后焦点返回“选择文件”按钮；本地默认选择不发网络请求。POST 503 后保留文件并显示错误，修正地址后重试成功；DELETE 失败保留远端记录，修正地址后重试并移除。

非阻断观察：

- P3：稳定 320px 视口下 demo 操作面约 190px，说明文字大量换行，操作需要滚动；没有页面级横向溢出，控件仍可用。
- P3：主题色与东方色以文字选项显示，增加色样可减少逐项切换预览的成本。

930px 首帧额外约 5px 宽来自 Dumi 搜索栏布局过渡，约 100ms 后稳定为 930px。320px 目录退出动画结束后侧栏隐藏，Upload 和 Tooltip 页面正文均不被目录遮挡；瞬态截图不作为稳定布局缺陷。

## Assessment B：独立技术和浏览器评审

代码/服务端契约复审结论为 **GO**，没有可复现 P0-P3。Playwright 请求由 route mock 截获，实际检查浏览器生成的 multipart 文件内容和应用的恢复行为；不声称验证了生产服务器、存储、认证、授权或部署。

| 技术维度 | 评分 | 依据 |
| --- | ---: | --- |
| 无障碍 | 3/4 | 地址标签、键盘文件选择、操作命名和焦点保护已验证；真实系统文件选择器取消未验证。 |
| 性能 | 3/4 | 上传进度使用 transform，reduced-motion 下无过渡和装饰动画；未测生产服务端负载。 |
| 主题 | 3/4 | 局部暗色和 token 跟随有效；完整密度和色板矩阵未覆盖。 |
| 响应式 | 3/4 | 1280、930、390、320 CSS viewport 的页面根无横向溢出；320px demo 较窄。 |
| 实现完整性 | 3/4 | 本地暂存、上传、失败恢复、远端删除和安全 fileId 路径齐全；服务端能力由宿主负责。 |
| **合计** | **15/20** | **局部审计，不代表全库验收。** |

浏览器专项 `tests/browser/upload-network.spec.ts` Chromium **8/8**：multipart 上传与重试、无效地址拦截和恢复、删除失败恢复、焦点不被异步结果抢回及删除后恢复、不安全 fileId、拖放、键盘选择、暗色与 reduced-motion。错误排空未发现 pageerror、console error、requestfailed 或非预期 HTTP 错误；503 为预期 mock。

1280×720、930×720、390×844、320×740 的页面总宽均等于视口；Upload demo 宽分别为 870、520、260、190px。暗色切换更新局部 token。限速 8MB mock 中，普通动效观察到 `aria-valuenow=13`、inline `scaleX(0.13)` 和 `0.18s` transition；reduced-motion 观察到 `aria-valuenow=8`、计算矩阵 `scaleX(0.08)`、`0s` transition，图标动画为 none 且没有活动动画。普通模式的计算矩阵读数落在过渡启动帧，未单独测过渡后的矩阵值。

Impeccable detector 初次发现 `.progressValue` 的 `transition: width`；已改为 100% 固定宽度及 `scaleX(percent / 100)`。最终 `detect.mjs --json docs/demos/upload-network.tsx docs/demos/upload-network.module.css` 原始输出 `[]`、stderr 为空、退出码 0。`[]` 仅代表确定性规则没有命中，不作为视觉或交互通过证明。

## 工程门禁与未覆盖范围

- `npm run check`：55 个测试文件、606 项通过；包含 104 个 demo 类型检查、格式、TypeScript、ESLint。
- `npm run check:scaffold`、`npm run build:lib` 和 `npm run build:docs` 通过。Dumi 导出 160 个 HTML、480 个本地 JS/CSS 引用、89 个嵌套 demo。
- 未验收：真实生产后端、存储、认证、权限、并发和断点续传；真实系统文件选择器取消；真实读屏、200%/400% page zoom、实体触控、设备性能和目标部署。

Questions skipped: 用户已确认本轮 Upload 范围与设计方向，当前没有待决产品选择。
