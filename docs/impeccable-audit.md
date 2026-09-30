# Impeccable 审查记录：DynamicForm 与 Dumi 文档页

## 2026-09-29：1B Data Interaction 最终复审

Pagination、Table、Tree 已分别完成 GPT-6-ASTRA 中度推理最终只读复审，结论均为 **GO**，未发现 P0/P1/P2。Pagination 记录 SSR-safe marker ref、StrictMode/多实例生命周期和 `identifierPrefix` 限制；Table 记录公开根入口类型、泛型行推断、稳定 `rowKey`、受控分页/筛选/排序/选择、fixed/scroll/virtual 前提；Tree 记录 `TreeDataNode` 自定义泛型、受控 keys、异步 `loadData` 宿主边界和 virtual/height 限制。三者均保持 AntD 根节点、无布局 wrapper、CSS Modules scoped token，不承诺业务请求、URL、权限、缓存或自动 key。

1B 定向测试：Pagination 7/7、Table 6/6、Tree 6/6；三组件均通过 `format:check`、`typecheck`、`lint`、`check:scaffold`、`build:lib` 和 `build:docs`。静态 detector 对三个组件目录均返回 `[]`；仅代表确定性规则无命中，不能替代真实视觉审查。全量浏览器专项仍需在后续页面组合批次验证 320px/200% 缩放、完整主题矩阵、reduced-motion、真实 Table 横向滚动和 Tree 大数据虚拟滚动。

## 2026-09-29：1B Pagination/Table 复审

Pagination 与 Table 已分别完成 GPT-6-ASTRA 中度推理复审并达到 **GO**。Pagination 复审确认 SSR-safe effect、StrictMode/卸载 ref 清理、单 root 多实例 marker 隔离、AntD 5 `<ul>` ref 适配、className/CSS scope 和受控/非受控协议；Table 复审确认只使用 `antd` 根入口的 `TableProps`、`TableColumnsType` 和 `ComponentRef<typeof AntTable>`，不暴露 `antd/es` 或 `rc-table` 路径，泛型 forwardRef、rowKey、受控分页/筛选/排序/选择、fixed/scroll/virtual 边界和无 wrapper 布局契约均清晰。两组件未发现 P0/P1/P2。

Pagination 7 个定向测试、Table 6 个定向测试均通过；Table 虚拟化测试使用 numeric `scroll.x=600` 与 `scroll.y=200`，符合 AntD 5 前提。静态 detector 对两个组件目录均返回 `[]`；该结果只表示确定性规则无命中。jsdom 中 rc-table 的 `getComputedStyle` stderr 是测试环境噪声，未造成失败。浏览器已验证 Pagination 文档页的受控/非受控、键盘/disabled、ref 适配和 SSR/multi-root 限制说明；Table 的真实滚动/虚拟化视觉矩阵仍需后续浏览器专项复测。

## 2026-09-29：1B Pagination 最终复审

Pagination 已完成 GPT-6-ASTRA 中度推理最终只读复审，结论为 **GO**，未发现 P0/P1/P2。复审确认 SSR-safe effect、StrictMode/卸载时 ref 清理、单 root 多实例 marker 隔离、AntD 5 `<ul>` 根节点适配、className 透传、CSS Modules scope、公共类型和受控/非受控行为测试。由于 AntD 5 的 Pagination 没有官方 ref，文档明确 ref 是 lx-ui 的 marker 适配行为，并记录多独立 React root 需使用不同 `identifierPrefix` 的限制。

Pagination 定向测试 7/7 通过，且 `format:check`、`typecheck`、`lint`、`check:scaffold`、`build:lib`、`build:docs` 通过。静态 detector 对 Pagination 目录返回 `[]`、退出码 0；该结果仅表示确定性静态规则无命中。浏览器验证将覆盖分页页码、键盘/disabled 语义和文档中的 ref/SSR 边界说明。

## 2026-09-29：1A Data Display 最终复审

1A（Result、Tag、Badge、Descriptions、Avatar、Statistic、Card、List）已完成 GPT-6-ASTRA 中度推理最终只读复审，结论为 **GO**，未发现 P0/P1/P2。复审覆盖泛型 List、`List.Item` 静态成员、wrapper/ref 契约、className 传递、Avatar 尺寸、Tag 间距、AvatarGroup 公共类型、CSS Modules 作用域和行为测试。AntD `Avatar.Group maxCount` 仅输出已有弃用提示，当前不阻断交付。

工程证据：29 个测试文件、83 个测试通过；`format:check`、`typecheck`、`lint`、`check:scaffold`、`build:lib`、`build:docs` 和 `npm pack --dry-run` 通过。Impeccable 静态 detector 对 `src/components/data-display` 与 `docs/demos/data-display.tsx` 均返回 `[]`、退出码 0；该结果只表示确定性静态规则无命中，不能替代真实视觉审查。浏览器已打开 `/components/data-display/avatar`，验证文档层级、主题控制、组件说明、ref/layout 契约和实际渲染截图。由于当前浏览器 capability 未提供 viewport 覆盖，窄屏矩阵沿用既有 DynamicForm 证据，1A 的完整窄屏/对比度/reduced-motion 仍列为后续验证项。

> 日期：2026-09-27。目标：`src/components/form/dynamic-form`、`/components/form/dynamic-form`。这是当前目标的审查，不代表整个 lx-ui 通过验收。
>
> 方法：双代理独立评审。A：`/root/impeccable_design_a`（设计/UX，未看检测器）；B：`/root/impeccable_evidence_b`（确定性检测器/浏览器，未看 A）。主代理负责技术审计、综合、修复和复测。Impeccable skill 版本 4.1.3；项目设计依据为 `design.md`、`UI/` 和现有 token。

## 先前结论纠正

先前 `detect.mjs --json src` 输出 `[]` 被表述为 Impeccable 通过；此结论无效。该工具不覆盖真实渲染、用户任务、视觉层级和交互状态。上次 URL 扫描因缺少 Puppeteer 未执行浏览器检查；本次 B 组通过独立浏览器注入获得页面级证据。技能执行规则已写入 `docs/impeccable-workflow.md` 并由 `AGENTS.md` 强制引用。

## 技术审计基线

按 `reference/audit.md` 的五维 0-4 分量表评估修复前状态；没有浏览器证据的组件状态不赋予“通过”。

| 维度       |     分数 | 已验证依据                                                            |
| ---------- | -------: | --------------------------------------------------------------------- |
| 无障碍     |      2/4 | Dumi 内联代码文本约 3.3:1；组件页无 live form，字段键盘路径不可验证。 |
| 性能       |      2/4 | 组件有异步取消/防竞态；页面/库产物与交互延迟尚无完整测量。            |
| 主题       |      2/4 | token 与 Provider 已实现；文档页无组件主题矩阵和运行时切换证据。      |
| 响应式     |      1/4 | 930px 顶栏导航被挤成竖排；320px/缩放和 live form 尚未完成复测。       |
| 实现完整性 |      2/4 | CLI 扫描 0 条；静态示例却无法执行，loading/error 整体替换表单。       |
| **合计**   | **9/20** | **Poor，仅为修复前基线**。                                            |

实现完整性结论：产品 API 和 token 方向基本连贯，但页面没有兑现“可操作示例”，且表单的全局状态与异步失败恢复路径不完整。CLI 的零命中不改变这个结论。

## 独立设计评审基线

A 组在浏览器查看首屏、全文可访问性树、末尾和目录跳转；设计特异性判断：标准 Dumi 阅读体验克制且适合内部开发者，但承诺的 ERP/CRM 表单、主题和密度没有实物示范。Nielsen 启发式评分为 **23/40**，当前为暂定基线，运行态相关项仅有源码证据。

| #   | 启发式       | 分数 | 主要依据                                    |
| --- | ------------ | ---: | ------------------------------------------- |
| 1   | 系统状态可见 |    2 | loading 仅 Spin，示例不可操作。             |
| 2   | 现实世界匹配 |    3 | 客户/金额/等级语境具体。                    |
| 3   | 控制与自由   |    2 | loading/error 替换字段和操作区。            |
| 4   | 一致性与标准 |    3 | 文档结构清楚，基于 AntD 公共语义。          |
| 5   | 错误预防     |    2 | required 与竞态护栏存在，提交防重示例缺失。 |
| 6   | 识别胜于记忆 |    2 | 隐藏值和联动结果只能靠文字推演。            |
| 7   | 灵活性与效率 |    2 | 无 live demo 或紧凑 Props 表。              |
| 8   | 审美与极简   |    3 | 阅读层级清楚，长段落仍有负担。              |
| 9   | 错误恢复     |    2 | 异步选项“加载失败”没有重试入口。            |
| 10  | 帮助与文档   |    2 | 边界解释充分，任务型 recipe 不足。          |

认知负荷问题集中在首次采用：首屏先讲底座和协议，开发者尚未操作字段就需要记住受控回填、隐藏值保留和提交过滤。阅读体验无需营销式重设计；优先用真实业务 demo 和结果显示降低推演成本。

## 检测器与浏览器证据

- CLI：`node C:\Users\Administrator\.codex\skills\impeccable\scripts\detect.mjs --json src/components/form/dynamic-form`，退出码 0、输出 `[]`、0 个规则命中。
- B 组新建独立 IAB tab；可变注入预检成功，临时 live server 注入 `detect.js` 成功，结束后已停止。因子代理环境不支持 `visible:true`，覆盖层只在后台运行，不宣称用户可见。
- 浏览器控制台：**67 条文档页命中**，其中低对比度 53（内联 `code` 49，搜索快捷键 1，细字/页脚 3）、行长 12、TOC 内边距 1、侧边链接溢出 1。内联 `code` 实测前景 `#d56161`、背景 `#f0f4f8`，约 **3.3:1**，属于真实 AA 问题；行长的字符计数不完全适合中文，应结合实际断行检查；TOC 紧贴边框和侧边项截断可能是 Dumi 有意设计，暂不据此改库组件。
- 主代理在 930×800 复现顶栏四项竖排，导航首项实际约 18×80px；在 390×844 检查了 Dumi 文档壳，未把窄屏截图推断为组件通过。修复仅作用于文档站样式。

## 优先问题与处理

| 级别 | 问题与用户影响                                                             | 位置                                                      | 修复/复测状态                                    |
| ---- | -------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------ |
| P1   | 基础示例只是 `tsx pure`，无法体验校验、联动、保存及主题。                  | `src/components/form/dynamic-form/index.md`、`.dumirc.ts` | 实现可运行 demo；待浏览器复测。                  |
| P1   | 加载/错误时整个表单和操作区被卸载，焦点与输入上下文消失。                  | `src/components/form/dynamic-form/index.tsx`              | 保留字段并增加状态文本/恢复路径；待复审。        |
| P1   | Dumi 内联代码对比度约 3.3:1，影响阅读。                                    | Dumi 默认 `.markdown code`                                | 仅文档站覆盖 `docs/docs-shell.css`；待明暗复测。 |
| P2   | 下拉请求失败保留旧选项，错误只在空列表展示，易把旧值误当新结果且没有重试。 | `src/components/form/dynamic-form/index.tsx`              | 清晰错误/重试和测试；待复审。                    |
| P2   | 930px 顶栏中文导航被挤成竖排。                                             | Dumi 默认 Navbar 的 48px 间距                             | 文档站平板断点覆盖；待截图复测。                 |
| P2   | Props/defaults 与保存恢复示例不集中，新开发者需翻源码。                    | `src/components/form/dynamic-form/index.md`               | 增加紧凑 API 表和任务型示例；待复审。            |

正向证据：产品边界清楚，示例使用真实 CRM 字段，基础控件、主题 token、AntD 公共 API 和异步竞态保护已有合理基础。文档站的标题/目录层级可读，应保持这种克制的阅读结构。

## 复测门槛

代码合并后检查桌面、930px、390px，light/dark、compact、键盘、required 错误、保存与重置、异步失败重试、reduced motion。确认构建出口中不包含 Dumi demo；运行全套工程门禁。只在对应项目实际通过后更新本表，不把其他配色/风格矩阵自动标记为已验证。

## 2026-09-27：Radio、Upload、Empty、Skeleton 批次

> 目标：`src/components/form/radio`、`src/components/form/upload`、`src/components/data-display/empty`、`src/components/data-display/skeleton` 及对应 Dumi demos。设计依据：`UI/P0 基础组件-Form/code.html`、`UI/P0 基础组件-Data Display/code.html`、`design.md` 和 lx token。Impeccable skill 版本 4.1.3。

### 方法与确定性扫描

- Assessment A：`/root/impeccable_design_a` 独立进行设计/UX 评审，没有读取检测器结论；Nielsen **26/40**，认知负荷中等。
- Assessment B：`/root/radio_upload_primitives` 独立运行检测器并尝试浏览器验证；首次因浏览器 surface/路由热更新时序受阻，第二次确认根路径 200、组件路由在等待编译后可用，但代理环境仍无法创建浏览器 tab。
- 主代理补充浏览器验证：使用 Codex in-app browser 打开 `/components/form/radio`、`/components/form/upload`、`/components/data-display/empty`、`/components/data-display/skeleton` 和 `/components/form/dynamic-form`。检测器命令为：

  `node C:\Users\Administrator\.codex\skills\impeccable\scripts\detect.mjs --json src/components/form/radio src/components/form/upload src/components/data-display/empty src/components/data-display/skeleton`

  原始输出为 `[]`。这只代表确定性规则没有命中，不作为视觉通过依据。

### 技术审计评分

| 维度       |      分数 | 证据                                                                                                                                                                   |
| ---------- | --------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 无障碍     |       3/4 | Radio 使用原生单选键盘语义并有可读 legend；Skeleton loading 时提供 `role=status`、`aria-busy` 和 label；Upload demo 有 accept 和状态文字。窄屏和屏幕阅读器未完整覆盖。 |
| 性能       |       3/4 | 无新依赖，wrapper 可 tree-shake；Skeleton 只在 loading 时渲染 AntD 骨架；包解包约 311KB。未做真实 Core Web Vitals 测量。                                               |
| 主题       |       3/4 | 组件使用 `--lx-*` token，DynamicForm 实测 dark/glass/compact 运行时切换；Dumi 暗色壳与 demo Provider 是独立作用域。13 套主题未逐一实测。                               |
| 响应式     |       2/4 | 默认桌面页面无横向滚动；当前 CUA tab 没有 viewport 覆盖能力，930/390/320 本批未重新截图。                                                                              |
| 实现完整性 |       3/4 | 公开入口、`lx-ui/antd` 清单、CSS Modules、类型、文档、行为测试和 demos 齐全；设计稿中完整拖拽上传/进度卡片仍属于后续组合能力。                                         |
| **合计**   | **14/20** | **Good；主要剩余风险是窄屏矩阵和更丰富 Upload 生命周期的范围确认。**                                                                                                   |

### 本批浏览器证据

- **Radio**：页面 demo 显示可读“客户等级” legend、标准/重点/禁用选项；对第一个 radio 执行 ArrowRight 后第二项 checked，页面无横向溢出。
- **Upload**：页面 demo 显示本地文件选择、`.pdf,.doc,.docx` accept 和“尚未上传”状态；DOM 中存在一个 file input，`scrollWidth === clientWidth`。未选择真实文件，避免把本地文件传入页面。
- **Empty/Skeleton**：Empty 默认、小尺寸和 action 同屏；Skeleton 可切换加载、内容和模拟失败，失败状态显示“重试”，点击后恢复到 `aria-busy=true` 的骨架。
- **DynamicForm 回归**：验证必填错误、深色玻璃风格、紧凑密度、运行时主题选择和桌面无横向溢出；Radio/Upload 已通过 FieldRenderer 的 lx-ui wrapper。
- **明暗**：Dumi shell 可切换 dark；DynamicForm demo 自己切换到 dark/glass/compact 后输入表面、边框和文字同步变化。Radio/Upload/Empty/Skeleton 的 demo Provider 默认 light，刻意与文档壳隔离，避免 Dumi 主题变量污染组件 token。
- **未覆盖**：当前浏览器 API 未提供 viewport override，因此本批没有新的 930px、390px、320px 截图；reduced-motion 通过源代码 `matchMedia` 回退和测试覆盖，未在系统级偏好切换下截图。React 19、Safari/Edge 和 13 套主题仍未声明为实测通过。

### A 评审问题与修复

1. **P1 demo 证据不足**：Radio、Upload、Skeleton 原先只有静态代码片段。已增加各自 `<code src>` 可运行 demo，并为 Skeleton/Empty 增加 loading→ready→error→retry 路径。
2. **P1 Upload 语义容易误读**：已实现无 `action/customRequest` 时本地选择、有 transport 时放行 AntD 生命周期，并在文档写明显式 `beforeUpload` 的优先级和风险。
3. **P2 Radio 缺少标签**：demo 改为 `fieldset/legend` 并保留 `aria-label`，可直接验证键盘选择。
4. **P2 AntD ref 与私有 DOM**：Empty/Skeleton 的 ref 固定在 lx-ui 外层；CSS 不再依赖 `.ant-*` 私有结构，Empty 使用 AntD 公开 semantic styles。
5. **P2 设计稿范围差异**：完整拖拽区、上传进度卡片和业务重试暂不伪装成 primitive 已交付；边界写入 `design.md` 的 8.4，后续按组合组件重新评审。

### 本批复测门禁

- `npm run check:scaffold` 通过。
- `npm run check` 通过：Prettier、TypeScript、ESLint、17 个测试文件 / 44 个测试。
- `npm run build:lib` 与 `npm run build:docs` 通过。
- `npm pack --dry-run` 顺序复测通过：250 个文件，约 63.4KB 压缩、约 311.2KB 解包；产物只含 `dist`、文档、许可证和变更记录，不含 demos/tests。

## 2026-09-28：Impeccable 方法纠正与 DynamicForm 复审

> 目标：`http://localhost:8002/components/form/dynamic-form`，并抽查 `/components/form/upload`。设计依据：`design.md`、现有 token、DynamicForm 文档和浏览器实际渲染。Impeccable skill 4.1.3。

### 方法与重要纠正

- 本批采用双代理：A `/root/impeccable_ux_review_new` 只做设计/UX 评审；B `/root/impeccable_evidence_new` 只做 detector 和浏览器证据。A 代理环境无法取得 IAB 截图，因此其视觉结论由主代理的独立浏览器证据补充，并明确记录为限制。
- 正确的静态命令是 `node C:\Users\Administrator\.codex\skills\impeccable\scripts\detect.mjs --json <目标>`；`npx impeccable detect` 是可用入口，但当前 npx 版本为 4.1.0，项目加载 skill 为 4.1.3，因此项目复审以本地 skill 脚本为准。
- `src/components/form`、`src/components/form/dynamic-form` 和 `docs/demos/dynamic-form.tsx` 的原始输出均为 `[]`、退出码 0。它只表示确定性规则没有命中。
- URL 扫描尝试返回 `puppeteer is required for URL scanning`、退出码 1；URL detector 没有完成，不能写成通过。真实视觉证据由 Codex IAB 和人工交互补足。

### 设计评审

A 组 Nielsen 得分 **26/40（Acceptable）**。主要问题是三个预览选择器抢占客户录入主线、提交中/失败/重试状态不完整、条件字段出现/消失缺少解释、输入缺少格式引导、compact 移动触控尺寸需要明确规则。优点是客户字段语境真实、条件显示具备渐进披露、重置和主题矩阵便于验证。

### 技术审计

| 维度       |      分数 | 依据                                                                                          |
| ---------- | --------: | --------------------------------------------------------------------------------------------- |
| 无障碍     |       3/4 | 真实 label、键盘焦点、必填错误可见；未完成屏幕阅读器和 reduced-motion 系统验证。              |
| 性能       |       3/4 | 无新增控制台错误和横向布局异常；未做真实 Core Web Vitals/产物拆分测量。                       |
| 主题       |       3/4 | light 与 demo dark 的 token 切换实际生效；未逐一验证全部主题矩阵。                            |
| 响应式     |       3/4 | 1280×720、390×844 无横向溢出；930/320 全路由矩阵和 compact hit-area 仍需补测。                |
| 实现完整性 |       4/4 | DynamicForm 和 Upload 有可运行示例，空表单校验和焦点路径可验证；URL detector 缺失不冒充通过。 |
| **合计**   | **16/20** | **Good，但仍有明确 P1/P2 UX 待办。**                                                          |

### 浏览器证据

- 1280×720：`scrollWidth === clientWidth === 1265`。
- 390×844：`scrollWidth === clientWidth === 390`，刷新后无导航重叠残影；复测后已恢复默认视口。
- DynamicForm light 默认渲染；切换 demo 主题为 dark 后，组件根节点为 `data-lx-mode=dark`，输入背景 `rgb(27, 38, 48)`，边框 `rgb(97, 113, 124)`。
- 点击 `#name` 后焦点位于真实 input，`box-shadow: rgb(20, 108, 232) 0 0 0 2px`，没有包装层额外 outline。
- 空表单提交显示“客户名称为必填项”“联系邮箱为必填项”；Upload 显示“选择本地文件”和“未选择文件”。
- 浏览器 console 未发现 warning/error。

### 未覆盖范围

全部 13 套配色、React 19、Safari/Edge、系统级 reduced-motion 截图、屏幕阅读器输出、200%/400% 缩放、完整 930/320 路由矩阵和 standalone UMD 尚未声明为已验证。

这批记录明确保留：**`detect` 输出 `[]` 不等于 Impeccable 通过。**

### 修复后复测

- 按用户选择完成全部 P1：显示选项默认折叠；提交中禁用保存按钮并显示原位状态；失败保留输入并提供重试；成功提供“查看客户 / 继续新增”；重点客户规则和字段提示可见。
- 补充 P2：名称、邮箱和负责人输入示例；移动断点将 demo 控件和表单交互区域提升到至少 44px；新增成功/警告/错误/信息背景 token。
- 构建后浏览器证据：1280px 下 `scrollWidth === clientWidth === 1265`，390px 下 `scrollWidth === clientWidth === 390`；默认 `details.open === false`；名称 placeholder 正常存在；控制台无新增错误。
- 修复后目标 detector 原始输出仍为 `[]`、退出码 0。该结果只说明静态规则未命中；URL detector 仍因环境没有 Puppeteer 而不可用。
- 本轮 P1 已按真实交互路径复测，未覆盖范围仍包括全部 13 套配色、React 19、Safari/Edge、系统级 reduced-motion 截图、屏幕阅读器、200%/400% 缩放和 standalone UMD。
