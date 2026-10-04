# Impeccable 审查记录：DynamicForm 与 Dumi 文档页

## 2026-10-01：General 与其余 Form 详细文档

- 本批覆盖 General 五页、基础 Form 八页与 DynamicForm，共新增 39 个独立运行示例；已有 31 个组件页具备样式展示、使用方法、参数、事件及实例边界。
- Impeccable 4.1.3，Read 模式；独立 A `/root/input_docs_impeccable_a` 与 B `/root/feedback_2a_sol61_review` 均使用 GPT-6.1-SOL xhigh。A 修复前 Nielsen 29/40，B 五维源码评分 16/20，分数不随主代理推测的改善抬高。
- B 命令：`node C:/Users/Administrator/.codex/skills/impeccable/scripts/detect.mjs --json src/components/general src/components/form docs/demos`。原始结果 `[]`、退出码 0，只代表零确定性规则命中。完整独立评分、角色分析和问题记录见 `.impeccable/critique/2026-09-30T18-17-22Z__src-components-form-dynamic-form-index-md.md`。
- 按评审返工：custom renderer 完整转发 Form 的 ARIA 属性；数量错误关联说明；Select 提供可控制失败、同步锁、卸载清理和重试保留值；Ghost 使用公开 style 修正 hover 对比；尺寸、图标、部门和审批文字明确。
- B 最终限定静态 GO，无未关闭代码 P1/P2；93 个示例源码类型检查通过，Divider 回归 4/4，Ghost 的 156 组 token 对比最低 4.799:1。全量 37 文件 / 264 项测试、lint、scaffold、库与文档构建通过；打包预检 502 文件、压缩 134100 字节、解包 644841 字节，无示例/测试混入。
- 浏览器 localhost 访问被安全策略拒绝，未换入口绕过。没有当前真实截图或布局、主题、键盘、缩放、日期、文件选择、Clipboard、reduced motion 的通过证据；该 P1 缺证继续开放。静态复审及提交不称为完整视觉交付。

## 2026-10-01：Input 文档与本批设计一致性返工

方法为双独立代理：A `/root/input_docs_impeccable_a` 做设计与阅读体验评审，B `/root/feedback_2a_sol61_review` 做检测器、技术审计及代码复审。均为 GPT-6.1-SOL xhigh；实施返工使用 medium。Impeccable 4.1.3 的 context 在本会话只运行一次，后续按 audit/critique/polish 执行。

Input 新增六个独立可运行示例：基础受控、尺寸、校验与禁用、前后缀、多行、实例方法。文档补使用方式、Props、事件、TextArea 参数、ref 方法和边界；源码默认收起但完整可查看。Dumi 构建确认生成六个 demo 路由。共享演示容器显式导入基础样式，避免直接打开页面缺少字体、玻璃回退和降级规则；Input 不再用统一最小高度覆盖继承尺寸。

A 的修复前 Nielsen 评分为 27/40；B 的最新源码技术评分为无障碍 3、性能 3、主题 3、响应式 3、完整性 4，合计 16/20。已关闭输入法回车误查询、空查询状态失真、隐含必填和默认展开全部源码问题。评分是源码证据摘要，未据此宣称视觉或 WCAG 验收通过。

Input 目标及本批扩大静态范围的 detector 原始输出均为 `[]`；只代表确定性规则无命中。完整 A/B 记录保存在 `.impeccable/critique/2026-09-30T17-28-38Z__src-components-form-input-index-md.md`，首次目标评分无历史趋势。浏览器工具被当前会话安全策略拒绝访问 localhost；未绕过，未注入覆盖层。桌面、930px、320–390px、明暗、密度、缩放、键盘和 reduced motion 仍待真实浏览器验证，此快照保持开放。

本批同时完成 A0 公开主题 token 映射、13 个 Data Display 组件的基础与交互文档、Feedback 三组件的九个专属示例，以及中文注释翻译。独立复审覆盖 Input、A0、Tag/Card/AvatarGroup/Descriptions/Statistic/Table/Pagination、展示 demo、Feedback 和 DynamicForm 计时测试；返工后结论限定为静态 GO。未完整补齐的 General 和其余 Form 详细文档不计入本轮完成项。

工程复测：37 个测试文件、261 项测试通过；类型、54 个文档源码的严格类型检查、lint、格式与 scaffold 通过；库和文档构建通过。最后的 Tag 禁用关闭返工增加一个公开行为测试，定向 7/7 通过并获独立复审。最终产物为 502 个文件、压缩 133702 字节、解包 643962 字节，不含文档示例和测试；该体积不是单组件最终应用包体。React 19、最低版消费 smoke、UMD、真实浏览器矩阵保持未验收。

Questions skipped: 用户已明确授权修复 P1/P2、继续实施和每批提交推送，本轮不重复询问方向与范围。

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

## 2026-10-03：Tooltip 交付复审与 P2 收口

> 目标：`src/components/feedback/tooltip`、三个 Tooltip Dumi demo 和 Feedback 设计输入。设计依据：`design.md`、`docs/design-review.md`、`UI/P0 基础组件-Feedback/code.html`。实施与返工使用 `gpt-6.1-sol` medium，独立复审使用 `gpt-6.1-sol` xhigh。

### 审查方法

- 按 `docs/impeccable-workflow.md` 执行 context、craft floor、audit、critique、polish 和独立 code review；检测命令为 `node C:\Users\Administrator\.codex\skills\impeccable\scripts\detect.mjs --json src/components/feedback/tooltip docs/demos/feedback-tooltip-basic.tsx docs/demos/feedback-tooltip-controlled.tsx docs/demos/feedback-tooltip-placements.tsx`。
- detector 原始结果为 `[]`、退出码 0；这只表示确定性规则没有命中，不作为视觉或无障碍通过依据。
- 第一轮独立复审发现兼容显隐文档缺口；返工补充 `visible`、`defaultVisible`、`onVisibleChange` 的优先级和迁移示例，并将 API 拆成常用、定位渲染、兼容弃用三组。
- 第二轮复审提出并关闭 3 个 P2：`classNames`/`styles` 类型说明精确化、demo 显示真实 `aria-describedby` 合并值、明确受控到非受控动态切换边界。第二轮复审未发现 P0/P1/P2 代码问题。

### 技术评分与浏览器证据

| 维度       |      分数 | 依据                                                                                                               |
| ---------- | --------: | ------------------------------------------------------------------------------------------------------------------ |
| 无障碍     |       3/4 | 默认 hover + focus；宿主描述 ID 与 Tooltip ID 打开时合并、关闭后恢复；原生按钮焦点路径通过。屏幕阅读器输出未实测。 |
| 性能       |       3/4 | 无新增依赖；MutationObserver 只用于文档 demo 的可见证据，不进入库组件。未做真实 Core Web Vitals。                  |
| 主题       |       3/4 | Stitch 深色表面与白字、亮色例外和 token 测试通过；暗色、compact 和全主题矩阵未在浏览器逐项截图。                   |
| 响应式     |       3/4 | 默认桌面和 360×800 窄屏无横向溢出，边缘 Tooltip 实际自动调整；约 930px、320px 和全 12 方位逐项交互未完成。         |
| 实现完整性 |       4/4 | 主出口、类型、公开 ref、ARIA 合并、3 个可运行 demo、文档 API、测试和 scaffold 齐全。                               |
| **合计**   | **16/20** | **静态与已覆盖浏览器范围 GO；完整视觉矩阵保留未验收项。**                                                          |

浏览器实际验证路径为 `http://localhost:8000/components/feedback/tooltip`（Dumi 忽略 `--port 8002`，实际监听 8000）。默认桌面与 360×800 下页面无横向滚动；基础 Tooltip 打开后 `aria-describedby` 为 `sync-field-description sync-form-description sync-status-tooltip`，焦点离开后恢复宿主描述；受控 demo 能打开并只有一个可见 `role=tooltip`；右边缘触点在窄屏下可见并自动调整。浏览器控制台没有新增 warning/error。

### 工程门禁

- `npm run check`：40 个测试文件、276 项测试通过；保留 AntD 弃用提示和 jsdom `getComputedStyle` 噪声。新增 Tooltip SSR 与 StrictMode 回归覆盖。
- `npm run build:lib` 与 `npm run build:docs` 通过，三个 Tooltip demo 路由生成。
- `npm run check:scaffold`、`npm run typecheck`、`npm run typecheck:docs`、`npm run lint`、`npm run format:check` 和 Tooltip/token 定向 97 项测试通过；独立复审最终未发现 P0/P1/P2 代码问题。

### 未覆盖范围

当前环境未提供稳定的 930px/320px viewport override、暗色和 compact 浏览器矩阵、200%/400% 缩放、系统级 reduced-motion、屏幕阅读器、Safari/Edge、React 19 消费 smoke 和全 12 方位逐项交互证据；这些保持为后续视觉验收任务，不写成已通过。

## 2026-10-04：Tag 与 Data Display 文档浏览器验收

> 目标：`src/components/data-display/tag/index.md`、Tag 组件及 demo、共享文档表格滚动样式、Data Display 页面 H1。设计依据：`UI/P0 基础组件-Data Display/code.html`、`design.md` 和现有 token。Impeccable skill 4.1.3。

### Impeccable 双代理评审

- Assessment A：`/root/tag_ux_review_luna`，隔离进行 UX 评审，Nielsen **35/40（Good）**。代理环境没有可用浏览器，故其视觉判断只作为源码与 Stitch 方向评审；浏览器事实由 Assessment B 和主代理分别复核。
- Assessment B：`/root/tag_final_tech_review`，独立检查检测器、当前 DOM/AX 和浏览器交互。未读取 A 组发现后才完成独立审计；检测器仅扫描 markup 文件：

  `node C:\Users\Administrator\.codex\skills\impeccable\scripts\detect.mjs --json src/components/data-display/tag/index.tsx docs/demos/tag.tsx src/components/data-display/tag/index.md`

  原始输出为 `[]`，退出码 0，扫描 3 个 markup 文件；CSS 不在该命令范围内。`[]` 只代表确定性规则无命中，不能表述为 Impeccable 通过。

- 设计特异性：ERP 模块、SLA、供应商标签、受控分类与 Tag Stitch 稿相符，面向中后台组件开发者。认知负荷：8 项检查中有 2 项选择数量关注，品牌色与东方色系分置于默认折叠的主题设置中，对主任务影响有限。
- UX 优点：业务文案贴近目标用户；主 API 表固定属性列并允许长类型折行；所有参数表有命名滚动区域、可见焦点和对应键盘说明。

| #        | Nielsen 启发式 |      分数 | 依据                                                     |
| -------- | -------------- | --------: | -------------------------------------------------------- |
| 1        | 系统状态可见   |         3 | 筛选、移除和恢复结果均有可见状态。                       |
| 2        | 符合真实世界   |         4 | ERP、SLA、供应商及状态语义具体。                         |
| 3        | 用户控制与自由 |         4 | 支持筛选、移除、取消关闭及恢复。                         |
| 4        | 一致性与标准   |         4 | 表格共享可聚焦滚动区域和辅助说明模式。                   |
| 5        | 错误预防       |         3 | 原生禁用与原因说明清楚；自定义关闭节点仍需宿主提供语义。 |
| 6        | 识别而非记忆   |         4 | 属性列固定，所有表格有名称，主表有专属固定列说明。       |
| 7        | 灵活与效率     |         3 | 触屏、键盘和精细指针均有路径；完整设备矩阵未完成。       |
| 8        | 简洁与美观     |         3 | 信息按主题分组；窄屏及暗色视觉仍有未覆盖状态。           |
| 9        | 错误识别与恢复 |         3 | 移除后可恢复并播报操作结果。                             |
| 10       | 帮助与文档     |         4 | API、键盘、本地化与自定义关闭责任均有说明。              |
| **合计** |                | **35/40** | **Good。**                                               |

### 五维技术审计

| 维度       |      分数 | 依据                                                                                    |
| ---------- | --------: | --------------------------------------------------------------------------------------- |
| 无障碍     |       3/4 | 表格 region、名称、说明关系和焦点可见；读屏器、局部化关闭名仍未在真实辅助技术环境实测。 |
| 性能       |       4/4 | 无新增依赖；demo 仅在关闭动作读取一次退出 token，计时器在卸载时清理。                   |
| 主题       |       4/4 | 组件依赖 lx token；浅/深固定列和表头使用文档主题变量，切换时颜色随主题变化。            |
| 响应式     |       4/4 | 320/390/930/1280px 页面无根级横溢；API 表可在自身区域横滚并保持首列。                   |
| 实现完整性 |       3/4 | 文档、demo、ARIA 说明与状态路径已覆盖；高倍缩放、读屏和全部主题矩阵待补。               |
| **合计**   | **18/20** | **仅对本批目标和已观察范围评分，不代表全库通过。**                                      |

### 浏览器证据与修复闭环

- 当前 Tag 页面：`http://localhost:8001/components/data-display/tag#api`。在 320×800、390×844、930×800 和 1280×720 检查，文档根与 body 均无水平溢出；390px 下表格外层可聚焦并横移约 40px，反向键盘操作可移回约 40px，属性列保持 sticky。Dumi 内层 overflow 为 visible，由可聚焦外层承接滚动。
- AX 检查显示一个正文 H1“Tag 标签”。四个表格 region 的 `aria-describedby` 均解析到唯一说明节点；只有主 API 表附加“属性列固定在左侧”，其余表只读取通用横向滚动提示。
- 点击/键盘路径验证业务筛选多选与“全部业务”互斥；Enter 移除标签后，120ms 退出完成并把焦点恢复按钮；用户已移焦时不抢焦点。禁用的“系统固定标签”和“历史归档”均有可读原因；组件操作消息通过 live region 更新。
- 浅色固定单元格/表头分别为 `#f7f9fb`、`#fbfcfd`，暗色为 `#050709`、`#020305`。粗指针模式关闭按钮和筛选按钮目标至少 44×44px；系统减少动态效果时关闭 token 为 0ms。正常退出动画没有逐帧测量。
- 主题设置默认折叠；浏览器 console 无新增 warning/error。检测器没有扫描 CSS，不以空数组替代视觉判断。

### 本批工程门禁

- `npm run check:scaffold` 通过；`npm run check` 通过，包括 Prettier、TypeScript、96 个 demo 源文件、ESLint，以及 41 个测试文件 / 292 项测试。
- `npm run build:lib` 与 `npm run build:docs` 均通过，Tag 文档和两个可运行 demo 路由均生成。Node 输出 `localStorage` experimental warning，但构建退出码为 0。
- `npm pack --dry-run --json`：516 个文件，141,084 B 压缩、671,899 B 解包；脚本解析的 demos、tests、docs-dist、Dumi 临时文件共 0 个。
- Vitest 仍输出 AntD `Progress.successPercent`/`success.progress`、`Avatar.Group.maxCount` 弃用提示，以及 jsdom 不支持伪元素 `getComputedStyle` 的噪声；这些不导致门禁失败，本批未改其行为。

### 问题与处理

| 优先级 | 问题                                                         | 处理状态                                                                                                                                                     |
| ------ | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P2     | 表格说明文字可能与方向键行为不符。                           | 已关闭：实测普通 ArrowRight/ArrowLeft 分别横移约 40px，文案与原生 overflow 行为一致。                                                                        |
| P2     | 默认关闭名称固定为中文，英文宿主可能让读屏用户听到中文名称。 | 本批按公开契约处理：英文宿主通过 `closable['aria-label']` 传入本地化名称，文档含完整示例且测试覆盖；集中式 Provider locale 协议列入 6A，在多语言发布前评审。 |
| P2     | 文档正文缺少可导航 H1。                                      | 已为 Tag 和 Data Display 其余缺失页面补标题；32 个公开路由 smoke 确认页面 title 与正文 H1 一致。                                                             |
| P3     | 禁用筛选缺少解释。                                           | 已增加“历史归档仅供查看，不能作为当前筛选条件”并通过 `aria-describedby` 关联。                                                                               |
| P3     | 主题面板内主题色选项较多。                                   | 暂不调整：设置默认折叠，两个调色组分离；记录为非阻塞观察。                                                                                                   |

### 本批验证边界

本节记录 Tag 与文档 H1 的局部通过。没有验证屏幕阅读器实际播报、200%/400% 缩放、Safari/Edge、完整 13 套主题与三种外观、正常退出动画逐帧、真实粗指针硬件或 React 19 消费；2B-1 全组件矩阵仍未关闭。

## 2026-10-04：Tooltip 窄屏文档与 ref 生命周期收口

> 目标：`src/components/feedback/tooltip/index.tsx`、`merged-ref.ts`、Tooltip 测试、Dumi 文档和两个 Tooltip demo。设计依据：`UI/P0 基础组件-Feedback/code.html`、`design.md`、现有主题 token。Impeccable skill 4.1.3；实现与两轮复审使用 `gpt-6-luna` max。

### 双代理审查和 detector

- Assessment A：`/root/tooltip_impeccable_critique` 独立检查 Tooltip 设计和页面，首轮 Nielsen 评分 **33/40（Good）**。优先问题为 API 标识符在 320px 拆行、ARIA 诊断段落默认占据较多空间、两个最长位置标签超出按钮边界 3–5px。三项均由本轮 polish 修复；主代理复测数据见下文。
- Assessment A 完成最终复核后确认三项问题均已关闭，没有发现新的阻断；评分维持 **33/40（Good）**。该子代理的 IAB 不可用，最终的窄屏判断以主代理记录的 320/390px 实际浏览器数据为依据，不能表述为子代理独立截图验证。
- Assessment B：`/root/tooltip_impeccable_evidence` 独立执行确定性扫描。命令为：

  `node C:\Users\Administrator\.codex\skills\impeccable\scripts\detect.mjs --json src/components/feedback/tooltip/index.tsx src/components/feedback/tooltip/index.md docs/demos/feedback-tooltip-basic.tsx docs/demos/feedback-tooltip-placements.tsx`

  初次原始 JSON 为 `[]`，exit code `0`。B 代理的页面新标签在子代理隔离环境导航超时，未取得页面 overlay 或页面内 `impeccable` console 证据；主代理随后使用 Codex In-app Browser 新建本地 Tooltip 标签，完成人工页面、键盘和 console 复验。最终 markup 复扫原始输出仍为 `[]`、exit code `0`，共扫描 4 个 TSX/Markdown 文件，不包括 CSS。`[]` 只表示确定性规则没有命中；实际布局与交互结论来自下方浏览器记录，不把扫描结果当作 Impeccable 通过结论。

- 交付前独立 code review：`/root/tooltip_final_code_review` 使用 `gpt-6-luna` max 检查完整未提交差异，覆盖 Tooltip、合并 ref、测试、文档、demo、样式和 Dumi 补丁；未发现可复现的 P0–P3 问题。该代理未运行测试或构建，工程门禁由主代理执行并单独记录。

- 第一轮 code review 发现：动态 `title` 变空时受控 open 可能保留空弹层；React 18.3 开发模式不支持 callback ref 返回 cleanup。第二轮独立复审确认两个问题均已关闭，没有新增 P0/P1/P2。

### UX 与技术评分

| 维度                 |      分数 | 当前证据和限制                                                                                                    |
| -------------------- | --------: | ----------------------------------------------------------------------------------------------------------------- |
| Nielsen UX（A 首轮） |     33/40 | 首轮发现的窄屏参数断词、冗长诊断和按钮文字越界均已修复；最终 polish 复核应以本节实测为依据。                      |
| 无障碍               |       3/4 | `title` 动态变空时关闭弹层并移除 Tooltip 描述 ID；宿主描述保留；表格有命名、焦点和键盘滚动。屏幕阅读器未实测。    |
| 性能                 |       3/4 | 没有新增运行时依赖；ARIA DOM 写入有值比较；未测真实 CWV。                                                         |
| 主题                 |       3/4 | 延续现有 Tooltip 公共 token 与 Dumi theme 样式；只复查了当前浅色页，完整主题矩阵未做。                            |
| 响应式               |       4/4 | 320px、390px 页面根无水平溢出；参数表限制在自己的滚动区，方位标签单行并留在按钮内；其他组件矩阵不计入此局部评分。 |
| 实现完整性           |       3/4 | demo、API、ref 生命周期测试和文档更新齐全；React 19 renderer、屏幕阅读器和缩放矩阵仍待验收。                      |
| **技术合计**         | **16/20** | 仅评 Tooltip 本批已覆盖范围，不能代表全库或完整 2B-1 通过。                                                       |

### 浏览器复验

- 页面：`http://localhost:8000/components/feedback/tooltip`；Codex In-app Browser 新建标签；DPR 1。320×800 时 `documentElement/body scrollWidth/clientWidth` 为 `305/305`；390×844 为 `375/375`。页面根不横向滚动。
- 本轮默认浏览器视口为 718×884，页面 H1 为“Tooltip”，`documentElement/body scrollWidth/clientWidth` 均为 `703/703`，页面无水平溢出；8 个原生诊断 `<details>` 默认均关闭。该轮是默认视口抽查，不替代窄屏复测。
- 320px 下 Tooltip 常用参数 region 可视宽 257px、内容宽 1809px、`tabindex=0`。点击聚焦区域后按 `ArrowRight`，`scrollLeft` 从 0 变为 42px。参数名的 computed `white-space` 为 `nowrap`，抽查的 `children`、`defaultOpen`、`onOpenChange`、`afterOpenChange` 和 `aria-describedby` 均单行。
- 320px 下 `rightBottom` 与 `bottomRight` 按钮盒宽 149px、内容滚动宽 147px，标签保持单行；390px 下按钮盒宽 106px、内容宽 104px。两个宽度下页面均无根级横向溢出。
- 基础 demo 中“查看当前 aria-describedby 完整值（不会自动播报）”默认关闭；手动展开后实际值为 `sync-field-description sync-form-description`。该区域是静态检查文本，没有 `role=status` 或 live-region 自动播报。
- 320px 下左侧触点打开 Tooltip 后自动翻至右侧，弹层矩形为 `x=165–237px`；关闭后根滚动宽恢复与可视内容宽相等。控制台 error/warn 查询为空。
- ReactDOM 18.3.1 真实 mount/unmount 测试覆盖宿主 callback ref 返回 cleanup 和无 cleanup 两条路径：前者恰执行一次宿主 cleanup，后者收到 `ref(null)`；没有记录 `Unexpected return value from a callback ref`。内部 ref 与对象 ref 均在 detach 后清空。React 19 renderer 未安装，React 19 消费 smoke 保留在 6A。

### 修复状态和未覆盖范围

| 优先级 | 发现                                                   | 状态                                                                                                                              |
| ------ | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| P2     | 动态 title 变为 `null`/`undefined` 后空 Tooltip 留存   | 已关闭：有效 open 与 `aria-describedby` 使用同一状态，并有回归测试。                                                              |
| P2     | React 18 callback ref cleanup 造成开发控制台告警       | 已关闭：外层 callback 始终返回 void，在 React 18 `null` detach 中执行暂存 cleanup 或转发 null；真实 18.3.1 mount/unmount 无告警。 |
| P2     | 窄屏 API 标识断词、ARIA 诊断默认展开、位置按钮标签越界 | 已关闭：`nowrap` + 局部滚动、原生 `<details>`、自适应按钮轨道；320/390px 浏览器复测通过。                                         |
| P3     | Escape 关闭 Tooltip                                    | 按用户决定延至 2B-2 锚定对话框原语统一设计，本批不实现也不声称通过。                                                              |

### 本轮工程门禁与页面复载

- `npm run check` 通过：Prettier、TypeScript、96 个 Dumi 示例类型检查、ESLint，以及 41 个测试文件 / 299 项测试均通过。保留已知 AntD 属性弃用提示和 jsdom 不支持伪元素 `getComputedStyle` 的测试输出噪声。
- `npm run check:scaffold`、`npm run build:lib` 和 `npm run build:docs` 均通过。文档构建自动重放固定版本 `dumi@2.4.49` 的补丁，并生成 Tooltip 主文档和三个 demo 路由。
- `npm pack --dry-run --json`：522 个文件，142,765 B 压缩 / 677,976 B 解包；未发现 `docs`、`docs-dist`、`patches`、`examples`、`tests`、`.dumi` 或 `__tests__` 文件进入包。
- `http://localhost:8000/components/feedback/tooltip` 完成整页重载后，当前页面 H1 为“Tooltip”，默认视口无页面级横向溢出，8 个原生诊断 `<details>` 均默认关闭；重载后的 console warning/error 为空。重载前日志中的 FormatJS 缺失翻译及 Webpack 模块解析错误来自旧会话，不能当作当前页面状态；补丁已重放后重新加载确认当前无新增错误。

本轮没有验证 React 19 renderer 实际 detach、屏幕阅读器输出、200%/400% 放大、系统 reduced-motion、Safari/Edge、全部主题外观组合或 Tooltip 全方位逐项截图。Assessment A/B 的边界和这些缺口均不构成整个 Tooltip 或 2B-1 全组件矩阵完成的结论。
