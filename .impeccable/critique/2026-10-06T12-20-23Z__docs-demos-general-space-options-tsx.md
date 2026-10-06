---
target: Space and Card docs demos
total_score: 30
max_score: 40
na_heuristics:
p0_count: 0
p1_count: 0
target_identity: "file:F:\\work\\lz-ui\\docs\\demos\\general-space-options.tsx"
target_fingerprint: "sha256:87dc5e892067ae133a69709c3a57a7c423931a06b673aa919676420a5e700723"
target_path: "F:\\work\\lz-ui\\docs\\demos\\general-space-options.tsx"
timestamp: 2026-10-06T12-20-23Z
slug: docs-demos-general-space-options-tsx
---
Method: dual-agent (A: isolated space_card_design_review; B: isolated space_card_detector_review)

## 范围与证据

- 日期：2026-10-06。目标为 Space Options 与 Card Dumi 示例，代码位于 `docs/demos/general-space-options.tsx`、`docs/demos/card.tsx` 和各自 CSS Module。
- Impeccable 4.1.3；在本会话以 `context.mjs --target docs/demos/general-space-options.tsx` 初始化；遵循 `adapt` 与 `craft-floor`。目标属于 Read 模式下的组件文档示例。
- A 组独立检查真实 Dumi 页和交互，覆盖 320、390、930、1280px；B 组独立运行 detector 与新 Playwright 页面检查。在 A 首轮后，发现标题截断并修复，再由 A 对最终页面完成一次确认轮。
- 设计特异性中高：Dumi 页面外壳较常规，示例内容使用采购、供应链风险、外部审计和运营指标，贴合 ERP/CRM 场景。
- 全部结论只适用于两个文档示例，不代表 lx-ui 组件本身的完整质量矩阵。

## Nielsen 启发式评分

| # | 启发式 | 分数 | 关键证据 |
|---|---|---:|---|
| 1 | 系统状态可见 | 3/4 | Card 加载、已加载 status 可见；未验证所有异步状态。 |
| 2 | 贴合现实世界 | 4/4 | 采购、供应链和审计内容符合目标业务场景。 |
| 3 | 用户控制与自由 | 3/4 | 可调 Space 宽度与方向；Card tab 可切换，加载后可完成并恢复焦点。 |
| 4 | 一致性与标准 | 3/4 | 沿用 lx-ui 组件和 Dumi demo frame；窄屏 tabs 使用横向滚动。 |
| 5 | 错误预防 | 3/4 | Space 预览宽度受容器约束；未发现主要操作的错误预防问题。 |
| 6 | 识别而非记忆 | 3/4 | 可见主题和操作控件；窄屏部分 tab 文案可见区域狭窄。 |
| 7 | 灵活性与效率 | 3/4 | Space 参数实时可调；Card 各业务 tab 与加载状态可交互。 |
| 8 | 美学与简约 | 3/4 | 示例层次清晰；320px Card tab 横向条带占用空间较大。 |
| 9 | 错误恢复 | 2/4 | 加载完成路径和焦点恢复工作；该 demo 不涵盖请求失败恢复。 |
| 10 | 帮助与文档 | 3/4 | 交互控件可探索，周边文档提供组件说明；窄屏代码块滚动提示不明显。 |
| **总计** |  | **30/40** | **Good（75%）；局部问题见下。** |

## 认知负荷与情绪路径

- Space 的宽度、方向、对齐、间距和换行控制紧邻预览；设置项容易和结果对应。对齐有 4 个可见选项，其余主要控制每组不超过 2–3 个选项。
- Card 的 3 个业务 tab 加 2 个加载动作在当前 demo 中保持在同一示例内；窄屏条带依靠内部滚动，当前标签的长文字辨识变差。
- 该文档示例不是高风险交易流程。加载开始有状态反馈，完成动作可恢复；示例没有模拟加载失败或重试。

## 优点与用户风险

- 优点：业务文案贴合 ERP 场景；宽度控制展示了受控参数与布局结果的关系；Card 把 tab、loading 和焦点恢复组合成可运行示例。
- Alex（效率用户）：示例控制项可以直接操作；键盘遍历和快捷操作未检查。
- Sam（键盘/辅助技术用户）：表单有关联标签，状态提示和焦点恢复可见；键盘全流程、可见焦点对比度和真实读屏未验证。
- Casey（移动用户）：页面内容宽度适配 320px；Card tabs 需水平滚动，示例源码面板也可能横向滚动。

## 发现及处理

- **[P1，已关闭] Space 固定宽预览和 Card 子项最小内容宽度在窄屏造成文档根水平溢出。** Space 改为受父级约束且保留宽度控制；Card demo 子项允许收缩。全部 32 页的三视口 smoke 和两个目标页的交互复验通过。
- **[P1，已关闭] Card 标题在 320px 被省略。** 改为 ReactNode 标题并以 demo 自有 CSS 换行。确认轮：320px 完整显示为两行、1280px 单行；Playwright 新增标题内容盒宽高断言。
- **[P2，未处理] 窄屏中英文混排正文两端对齐，窄列扫描较差。** 保留为文档展示 polish。
- **[P2，未处理] Space 示例代码在 320px 超出约 272px 的代码区，需要横向滚动且没有明显提示。** 组件页代码展示的通用视觉不属于本轮修复范围。
- **[P3，未处理] Card 文档小节标题末尾可能只剩一个字换行。** 仅影响局部阅读节奏。
- **[P2，未处理] Card tabs 在 320px 的横向视口较窄，部分标签文字省略。** 三项仍可横向滚动选择并显示对应内容；未改通用 Card tab 行为。

## 局部技术审计

| 维度 | 分数 | 依据及限制 |
|---|---:|---|
| 无障碍 | 2/4 | 表单标签有关联；加载状态与焦点恢复已检查。没有键盘全流程、对比度、axe 或真实读屏证据。 |
| 性能 | 3/4 | 修复只使用布局和 CSS Module，无新依赖或复杂运行逻辑；未测真实设备性能或 Core Web Vitals。 |
| 主题 | 2/4 | 沿用现有主题框架；仅检查默认外观，未覆盖暗色、密度及配色矩阵。 |
| 响应式 | 3/4 | 4 个视口根节点无溢出；Card tabs 仍需内部横向滚动。 |
| 实现完整性 | 3/4 | 两个复现问题已修、测试和独立 code review 通过；detector 不扫描 CSS Module。 |

## Assessment B

- 命令：`node C:\Users\Administrator\.codex\skills\impeccable\scripts\detect.mjs --json docs/demos/general-space-options.tsx docs/demos/card.tsx`；最终输出 `[]`，退出码 0。
- Detector 只扫上述两个 TSX 文件，不含 CSS Modules、共享 demo frame、Dumi 文档壳或渲染行为；`[]` 不作为设计通过结论。未注入 live overlay；B 组使用独立 Playwright 页面证据。
- Space/Card 两路由在 320、390、930、1280px 均未观察到文档根溢出。Space 的 360px 默认预览可在桌面调至 560px，在 320px 被约束到 190px。Card 在 320px 宽 190px、位置 x=65..255；标题盒 scroll/client 宽高相等；加载、完成、tab 切换和焦点恢复可用，无页面错误。
- 截图：`C:\Users\Administrator\AppData\Local\Temp\card-title-after-320.png`。没有保存直接展示 Space 预览控件的截图。
- 未检查物理手机、200%/400% 缩放、全主题矩阵和 reduced motion；鼠标交互的焦点恢复已检查，键盘可见焦点样式未评估。

## 复审与工程结果

- 独立 `gpt-6-luna` max code review：GO，无可操作 P0–P2；静态审查覆盖 CSS Modules、Card ReactNode 标题、Space 宽度约束、1500ms poll timeout 和标题裁切断言。
- `npm run typecheck:docs`（101 个 demo 源文件）、目标 Prettier、目标 ESLint、`npm run test:browser -- --grep "Space|Card"`（2/2）及最终 `--grep "Card："`（1/1）通过。
- 完整 `npm run test:browser:all`：Chromium 38/38、Edge 38/38；`npm run check`：55 个测试文件、444 个测试通过；`check:scaffold`、`build:lib`、`build:docs`、静态导出和 `npm pack --dry-run` 通过。
- 范围状态：两个根溢出问题和 Card 标题截断已关闭；P2/P3 文案、代码滚动提示和 Card tab 呈现保留在后续文档窄屏 polish。全库 2B-1 仍未关闭。

Questions skipped: The user requested continuation of the existing roadmap; this responsive fix needs no additional product decision.
