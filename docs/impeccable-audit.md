# Impeccable 审查记录：DynamicForm 与 Dumi 文档页

本文件按批次记录当时的审查结论；历史条目中的未关闭项可能已由后续记录重新分类或处理。Table 纯文本单元格方向键导航的当前状态见 [ADR-0005](./adr/0005-table-keyboard-model.md)。

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

## 2026-10-04：Input 文档收尾与 Dumi 单实例恢复

> 目标：`src/components/form/input/index.md`、六个 Input 文档 demo、共享 demo 容器和 Dumi 文档壳。设计依据：现有 Input API、`design.md`、P0 Form 设计输入与项目文档规范。Impeccable 4.1.3，Read 模式；评审代理使用 `gpt-6-luna` max。

### 独立评审与范围

- Assessment A：`/root/input_critique_a` 独立检查文档结构、业务用例和键盘边界，源码评估 Nielsen **31/40（Good）**。代理隔离环境两次均没有浏览器 surface，因此不把它的内容评分写成截图验收。A 最初将 AntD 清除按钮不在 Tab 顺序列作 P2；复核后确认文档已给出聚焦文本框、Ctrl/Command+A、Backspace/Delete 的完整替代路径，且不在 Tab 顺序是 AntD 的既定行为，故该项不构成已证实的 WCAG 键盘阻断，不作为未关闭 P2。
- Assessment B：`/root/input_critique_b` 对 9 个 markup 文件独立运行确定性扫描，范围为 Input Markdown、6 个 demo、清除图标及共享 demo 容器；原始 JSON 为 `[]`、退出码 0、规则命中 0。CSS 不在扫描范围内。代理隔离环境无法创建浏览器标签，未声称有 overlay、响应式或控制台检查结果。
- 主代理另用 Codex In-app Browser 检查实际 Dumi 页面、交互与审查链接。以上来源分开记录；检测器的空数组只表示确定性规则未命中，不表示 Impeccable 整体通过。

### 体验与技术评分

| 维度                       |      分数 | 依据                                                                                  |
| -------------------------- | --------: | ------------------------------------------------------------------------------------- |
| Nielsen UX（Assessment A） |     31/40 | 文档以客户、合同和采购场景组织；可运行示例先于最小用法，长参数表仍有扫读成本。        |
| 无障碍                     |       3/4 | 字段名称、错误说明、清除按钮的键盘替代路径和正文标题齐全；未实际测试屏幕阅读器。      |
| 性能                       |       3/4 | 无新增运行时依赖，示例状态局部更新；未采集 Core Web Vitals。                          |
| 主题                       |       3/4 | 示例跟随 Dumi 明暗模式，局部主题设置不持久化；未逐一验证全部风格、配色和密度。        |
| 响应式                     |       3/4 | 主代理检查桌面、平板和窄屏页面无根级横向溢出；未覆盖 200%/400% 缩放和真实粗指针硬件。 |
| 实现完整性                 |       4/4 | 页面有六个可运行 demo、完整 Input/TextArea API、事件与 ref 说明及可达的审查记录链接。 |
| **技术合计**               | **16/20** | 仅评本批文档与已观察范围，不代表整个组件库。                                          |

### 主代理浏览器证据

- `http://localhost:8000/components/form/input` 的实际页面标题和正文 H1 均为“Input 输入框”；基础受控示例和六个 demo 在可访问性树中渲染，第一条交互示例位于最小代码用法之前。
- 桌面 1280×720 首屏可见 Input 示例；930px 平板宽度下 Dumi 搜索输入跟随 205px 容器收缩，文档根和 body 均没有水平溢出；390px 和 320px 宽度下分别记录为 375/375 与 305/305 的可视宽度/滚动宽度。窄屏截图中组件宽度留在页面内容区内。
- 基础受控输入通过浏览器键盘路径验证：聚焦后设置测试值，按 Ctrl+A 和 Backspace，值与旁边状态都变为“未填写”；随后恢复默认“杭州云栖科技”，没有留下 demo 状态改动。合同简称与 TextArea 的同一键盘路径也写在各自 demo 旁。
- 审查链接实际打开 `/impeccable-audit`，页面正文和目录均成功呈现。Input 页面截图为 Dumi 深色外观；浏览器 console 未见本轮新增 warning/error。全套主题矩阵、系统级 reduced motion、屏幕阅读器和高倍缩放未验收。

### 8000 模块解析故障

- 复现背景为同一工作区同时运行多个 Dumi 开发实例；它们共用 `.dumi/tmp` 生成目录。用户报告 8000 出现 `Can't resolve '@@/dumi/meta/runtime.ts'`，而另一个端口页面可打开。检查时发现只有 Dumi 8000 实例存活，`.dumi/tmp/dumi/meta/runtime.ts` 已重新生成；在单实例状态下主页、Input、Tooltip 和审查记录路由均返回 200，浏览器 Input 页面也正常渲染。
- 已停止重复实例并保留单个 8000 服务，未修改 Dumi 生成文件。`docs/project-rules.md` 已补充单实例规则：排查 `@@/dumi/meta/runtime.ts` 时先检查生成文件和进程数量、停止重复实例，再启动一个 Dumi 服务并验证目标路由。当前 8001 未运行；不要把已停止的端口描述成可用。

### 工程门禁与问题状态

- `npm run check` 通过：Prettier、TypeScript、97 个 Dumi 示例源码类型检查、ESLint、42 个测试文件 / 302 项测试。现有 AntD 弃用提示和 jsdom 不支持伪元素 `getComputedStyle` 的测试噪声仍会输出；不影响退出码。
- `npm run check:scaffold`、`npm run build:lib`、`npm run build:docs` 均通过；Dumi 构建期间输出 Node `localStorage` experimental warning，但 Webpack 成功、退出码为 0，六个 Input demo 路由已生成。
- `npm pack --dry-run --json` 通过：522 个文件，143,693 B 压缩、680,976 B 解包；文件清单未包含 tests 或文档 demo。
- 构建前停止 8000 开发进程以避免共享 `.dumi/tmp`；生产构建通过后只重启一个 8000 实例并复测目标路由。
- P2 目录过长、首屏先显示静态代码、键盘清空说明缺失、平板搜索框溢出、审查记录无链接均已在本批处理并复测。Input API 表仍有 17 行，作为阅读成本观察保留；目前没有未关闭的 P0/P1/P2。

### 2026-10-04：Input 粗指针清除目标复审

- 目标：`src/components/form/input/index.tsx`、`index.module.css`、Input 单元测试和 API 文档。目的：修复粗指针设备下 AntD 清除按钮仍为约 12px 的触控可用性问题。
- Impeccable 4.1.3 确定性扫描命令：

  `node C:\Users\Administrator\.codex\skills\impeccable\scripts\detect.mjs --json src/components/form/input/index.tsx src/components/form/input/index.md docs/demos/input-basic.tsx docs/demos/input-size.tsx docs/demos/input-states.tsx docs/demos/input-affixes.tsx docs/demos/input-textarea.tsx docs/demos/input-ref.tsx docs/demos/input-clear-icon.tsx`

  原始结果为 `[]`，退出码为 `0`。该结果只说明确定性规则未命中，不替代实际页面审查。

- 方案：通过 AntD 公开的 `allowClear.clearIcon` 插槽包裹本地标记，CSS 只扩大该标记，不选择 rc-input 的内部 DOM，也不会影响宿主 suffix 中的其他按钮。触控设备下按钮和输入根节点使用 `--lx-control-target-touch-min`，默认 44px；清除图标依赖新增的 `@ant-design/icons` peer dependency，保持图标包外置。
- 独立 code review：`gpt-6.1-sol` 中度复审未发现 P0/P1/P2；极高复审指出并关闭了内部 DOM 选择器、Context suffix 类覆盖、测试父节点耦合、reduced-motion 和默认值类型边界。测试补充了 Input/TextArea 的 `input`、`textarea`、`suffix`、`count` 类名转发和公开 clearIcon 标记；文档补充 Input/TextArea 的 `bigint` 受控值与准确的 defaultValue 类型。
- 浏览器验证：Dumi `http://localhost:8000/components/form/input` 单实例运行；默认桌面清除按钮为约 12×12，开启 CDP 粗指针模拟并设置 390×844 后，清除按钮为 44×44，suffix 为 44×44，输入根节点为 245×62；页面正常渲染。页面未产生本轮新增 console error/warn。
- 工程验证：本批文件已运行 Prettier；Input 类型检查和 5 项组件测试通过；完整工程门禁与库/文档构建在提交前重新执行。未覆盖真实硬件屏幕阅读器、Safari/Edge 和全主题矩阵。
- 状态：本批新增 P2 已关闭；保留真实硬件和完整主题矩阵作为后续发布验收范围。

## 2026-10-05：DynamicForm 提交恢复与独立 demo 路由

⚠️ DEGRADED: single-context（两次 `gpt-6-luna` max 子代理请求都因额度预扣失败返回 403，独立 A/B 审查未能完成；本报告由主代理审阅）。

### 目标与方法

- 目标：`src/components/form/dynamic-form/index.tsx`、类型与文档、两个提交演示、Dumi 2.4.49 demo URL 补丁。
- 设计模式：文档阅读（Read）与后台表单操作（Operate）；依据 DynamicForm 设计说明、已有 Dumi 页和提交恢复流程。
- 本批 detector 命令退出码为 0，原始结果 `[]`。该命令在主代理手工体验评估之前执行，故不将它称为独立 Assessment B，也不据此提高 UX 评分。没有 detector overlay；仅使用实际页面和交互路径作本地检查。
- 独立代理未产出 UX 或代码审查结论。主代理按当前代码、测试、Dumi 页面及源文件差异作局部审阅；这不替代独立复审。

### 设计评估

| Nielsen 启发式 |      分数 | 依据                                                         |
| -------------- | --------: | ------------------------------------------------------------ |
| 系统状态可见   |       4/4 | 提交中、失败、成功均有文本状态；成功/错误由状态区域呈现。    |
| 贴近用户语言   |       4/4 | 使用客户、保存、重试、继续新增等 CRM 操作语汇。              |
| 用户控制与自由 |       3/4 | 错误可重试、完成后可继续新增；提交等待期间没有演示取消按钮。 |
| 一致性与标准   |       4/4 | 使用表单、输入、错误消息和按钮的既有行为。                   |
| 错误预防       |       4/4 | 必填与字段错误阻止业务提交，并把焦点移至首个问题字段。       |
| 识别而非记忆   |       4/4 | 保留失败值，重试动作就在错误旁，成功动作紧邻结果。           |
| 灵活与效率     |       3/4 | 键盘提交和按钮操作均可用；演示主题配置默认收起。             |
| 简洁与审美     |       3/4 | 演示按任务逐步展开，视觉沿用主题；完整 API 文档仍较长。      |
| 错误恢复       |       4/4 | 异步错误、字段校验失败、重试及表单值保留路径均有具体操作。   |
| 帮助与文档     |       4/4 | 说明 Props、错误回调、ref 返回值、宿主职责和迁移注意。       |
| **合计**       | **37/40** | **Good；只评本批目标和已观察状态。**                         |

设计特异性：示例围绕 CRM 客户录入和提交恢复编排，组件仍是面向 ERP/CRM 的通用动态表单。折叠主题选项使主流程聚焦；表单错误和恢复动作遵循已有 AntD/Dumi 交互方式。

有效观察到的重点问题及处理：

- **[P2，已修复] 重试控件卸载后焦点落到页面根节点。** 完整示例在重新提交时暂时卸载错误内的重试按钮。主代理浏览器观察到该边界，并为新出现的重试/成功动作设置回退焦点；新增测试验证点击重试后成功焦点到“查看客户”。主动移焦时不会强行抢回焦点。
- **[URL 记录更正]** 锁版 Dumi 2.4.49 的 `DumiDemo/index.js` 将 `props.demo.id` 原样拼入 `/~demos/`，不会编码 ID 中的 `/`；`routeId` 查询参数才调用 `encodeURIComponent`。`Previewer` 把同一个 `demoUrl` 用于独立页链接和 iframe。本项目补丁将客户端路由从 `~demos/:id` 改为 `~demos/*`，并从 `params['*']` 读取多段 ID。此前浏览器成功打开的是手工输入 `%2F` 的 URL；那条记录不能证明默认生成的 `href` 含有 `%2F`。
- Dumi `exportStatic` 也用原始 ID 生成嵌套输出路径；现有输出文件为 `docs-dist/~demos/components/form/dynamic-form-demo-dynamic-form/index.html`。本机静态文件映射 smoke test 对规范的原始路径返回 200。该输出不是本轮重新构建的证据：现存 `.dumi/tmp-production/appData.json` 仍记录 `~demos/:id` 路由，需在唯一 Dumi 实例空闲后重新构建并验证补丁后的静态运行时及目标部署服务器。

### 浏览器证据与范围

- 本轮 CUA 全新标签页直接打开原始路径 `http://localhost:8000/~demos/components/form/dynamic-form-demo-dynamic-form?routeId=src%2Fcomponents%2Fform%2Fdynamic-form%2Findex`；截图和 AX 树均显示完整表单字段、提示和操作按钮。组件文档页默认独立链接的 AX 树也显示原始 ID 路径。早先手工输入 `%2F` 路径的成功记录单独保留。本轮记录到本机 PowerShell `Invoke-WebRequest` 返回 404，但审计记录未保留具体请求 URL 和逐项响应；同一 8000 实例的浏览器导航却成功，因此该结果与浏览器证据存在冲突，不能据此判定开发路由通过或失败。
- 空提交在两个必填字段上显示就近错误并聚焦“客户名称”。填入“验收客户”和邮箱后，提交状态出现“正在处理，请稍候”；模拟首轮失败后字段值保留，重试成功并显示成功结果及操作按钮。点击“继续新增”清空表单、焦点移回客户名称。
- 独立提交 demo 通过 Enter 提交：状态从“正在保存客户”转为失败，保留“提交恢复验收”并恢复输入焦点；再次 Enter 提交后显示成功，焦点回到保存按钮。
- 本轮页面截图为桌面浏览器；浏览器工具本轮未提供可用的 viewport 设置接口，因此没有重新跑 930/390/320px。没有验证静态部署 URL、屏幕阅读器、200%/400% 放大、系统 reduced-motion、Safari/Edge、全配色矩阵或 React 19 renderer。
- 工程检查：`submission.test.tsx` 提交异常协议测试 5 项、`submission-demo.test.tsx` 提交 demo 测试 12 项（含新增焦点转换场景）通过；新增断言曾经历一次等待超时，调整为同步提交路径后定向测试通过。提交前仍需重新执行完整门禁。

### 技术审计

| 维度       |      分数 | 依据                                                                                                                       |
| ---------- | --------: | -------------------------------------------------------------------------------------------------------------------------- |
| 无障碍     |       3/4 | 标签、必填错误、焦点和键盘状态已验证；读屏未实测。                                                                         |
| 性能       |       4/4 | 没有增加运行时依赖；请求取消和 demo timer 清理有边界保护。未采集真实 CWV。                                                 |
| 主题       |       3/4 | 完整演示跟随 Dumi 明暗，局部切换有测试；完整色板矩阵未验。                                                                 |
| 响应式     |       2/4 | 本轮缺少受控窄屏视口实测，不能由源码或测试代替。                                                                           |
| 实现完整性 |       3/4 | 公开错误 API、有界宿主请求状态、可运行演示及默认原始路径的浏览器验证均有证据；补丁后的静态运行时和目标部署服务器仍待验证。 |
| **合计**   | **16/20** | **Good；局限于当前提交恢复目标。**                                                                                         |

复审结论：主代理没有发现当前代码中的 P0/P1；浏览器发现的 P2 已修复并由新增测试验证。独立子代理审查因服务额度失败未完成，不能把此批记为独立 code review GO。Questions skipped: 用户已明确授权按路线图自动继续，且本批没有待用户决策项。

## 2026-10-05：DynamicForm 级联与提交恢复浏览器补验

> 本节补充上文 DynamicForm 评审之后新增的 2B-1 浏览器证据。浏览器检查在 `http://localhost:8001/components/form/dynamic-form` 完成；本节不代表全库矩阵通过。

### 方法与评审状态

- Impeccable 4.1.3：本会话已执行一次 `context.mjs --target src/components/form/dynamic-form/index.md`，读取目标页现有评审快照，并运行 detector 检查 DynamicForm 文档与四个交互 demo。`latest` 目标 slug 为 `src-components-form-dynamic-form-index-md`，快照为 `.impeccable/critique/2026-10-05T05-09-34Z__src-components-form-dynamic-form-index-md.md`；快照已有关闭标记。本轮没有把 detector 的空数组描述为视觉验收，也没有重新运行页面 overlay。
- detector 对本轮指定的 Markdown 与 demo markup 输出 `[]`，退出码 0；仅表示确定性规则未命中，不评估页面层级、对比度、键盘或状态体验。
- 当前目录包含 5 个 H2 主章节和 9 个 H3 子章节。Dumi 2.4.49 没有 Markdown TOC 深度选项；隐藏目录会移除页面快速导航，降级这些标题会削弱章节层级。保留语义化分层，作为长篇组件 API 文档的非阻塞阅读成本记录；完整 API、demo 与边界内容符合用户要求，不以压缩篇幅为由删减。
- DynamicForm 级联与提交恢复的独立 code review 初始结论为 Request Changes：未发现 P0-P2 代码问题，发现 P3 文档记录需同步，包括示例数量、复审状态和浏览器/测试证据归属。相关记录已修订，并通过独立 follow-up review（GO），P3 已关闭。

### 浏览器交互证据

- 级联演示：在亮色主题选择“华东”→“杭州市”→“西湖区”，再将区域改为“华南”。可见状态播报“区域已更改，已清除城市和区县。”，当前 JSON 只保留 `location.region = south`，城市和区县均清空，区县禁用。重置后区域恢复华东、下级值为空、区县仍禁用，并播报“表单已重置，区域恢复为华东。”。
- 完整客户录入：启用模拟失败，填写测试值后提交。请求中显示等待反馈；失败后值保留，错误说明与“重试保存”处于同一视口，焦点位于重试按钮。重试成功后显示保存结果，焦点移动到“查看客户”。点击“继续新增”后字段清空、焦点返回客户名称。随后关闭模拟失败并折叠选项。
- 异步供应商：搜索“杭州”后失败提示允许再次操作；重试后浏览器显示成功消息，提示找到 1 个选项。重新展开列表并选择业务名称“杭州云栖科技”由 `tests/demos/dynamic-options.test.tsx` 验证，未记作手工浏览器观察。
- 手工验收结束时，Dumi 文档主题恢复亮色，级联恢复到初始“华东”，客户表单为空且设置折叠；本轮没有改变现有开发服务器状态。

### 问题状态与边界

| 优先级 | 发现与状态                                                                                                                                                       |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1     | 提交失败解释与恢复操作可能分离：本轮失败路径实际验证二者同屏，焦点落在重试按钮，已关闭。                                                                         |
| P2     | 异步选项恢复缺少视觉确认：已增加并验证可见候选数量提示；重新展开列表并选择业务名称由 `tests/demos/dynamic-options.test.tsx` 覆盖，未记作手工浏览器观察，已关闭。 |
| P2     | 级联 demo 跟随文档暗色模式：之前的暗色复验已显示 demo 表面同步变化；本轮在亮色模式完成交互并恢复初始值，已关闭。                                                 |
| P3     | 长 API 页导航项较多：保留 5 个主章节与 9 个子章节，完整文档仍长；通过明确层级、概览和场景 demo 支持扫读，保留为非阻塞观察。                                      |

本轮没有重新测量缩放视口、完整主题矩阵、真实屏幕阅读器、Safari/Edge、React 19 renderer 或静态托管 demo 路由。2B-1 仍在进行；需继续为其他公开组件积累浏览器证据。

## 2026-10-06：Table、主题 Token 与文档壳复审

Method: dual-agent（A：`/root/table_docs_ux_assessment`；B：`/root/table_impeccable_assessment_b`）。另由 `/root/table_token_code_review` 对 Table、主题 Token、测试和验收记录完成只读代码复审。

### 范围与方法

- 目标范围：`src/components/data-display/table/`、`docs/demos/table.tsx`、`src/theme/tokens.ts`、`src/styles/tokens.css` 与 Dumi 文档壳 `docs/docs-shell.css`。页面模式为 Read，演示中的表格交互按 Operate 审查。
- Impeccable 4.1.3：本工作会话已执行一次 `context.mjs`，此批按该快照和 Table 设计输入继续；读取并执行 `audit`、`critique`、`polish` 及 `craft-floor` 相关流程。本次 `latest docs/docs-shell.css` 没有先前快照，`.impeccable/critique/ignore.md` 不存在。
- A 在 detector 结果进入综合判断前独立评审视觉、信息层级和用户任务；B 使用独立 Chrome 配置新开页面检查桌面/窄屏、明暗主题和键盘滚动，并独立运行 detector。B 未发现 P0-P3；其演示状态选择器检查不确定，故不将该路径记为通过。
- `detect.mjs --json docs/demos/table.tsx src/components/data-display/table/index.md` 输出 `[]`、退出码 0。只表示确定性规则未命中；没有声称 detector 覆盖了布局、交互或视觉品质。本批没有成功注入可见检测 overlay，也不声称用户浏览器里存在 overlay。
- A 初评 31/40 中的“390px 表头 48px”和“页脚对比度不足”未被当前证据复现，不作为当前问题。交互表示例的 16 组矩阵 JSON 记录表头 36px、舒适/紧凑行高 48/36px；基础示例表头仅在截图中目测为 36px。文档壳的 Edge 154 计算颜色复测为浅/深色 AA 以上。最终评分依据下表已更新为 33/40，不沿用未经复核的初始观察。

### Design Health Score

|        # | 启发式         |            分数 | 当前证据                                                         |
| -------: | -------------- | --------------: | ---------------------------------------------------------------- |
|        1 | 系统状态可见   |             3/4 | 选择数、加载、错误、空状态有可读反馈；移动文档搜索入口不可用。   |
|        2 | 贴近真实世界   |             4/4 | 采购订单、供应商、履约、审批与金额形成真实 ERP 场景。            |
|        3 | 用户控制与自由 |             3/4 | 可筛选、取消选择、分页与返回详情；Dumi 移动搜索未提供入口。      |
|        4 | 一致性与标准   |             4/4 | 行高与密度由主题 Token 明确映射，窄屏横移限制在命名表格区。      |
|        5 | 错误预防       |             3/4 | 行选择、全选和操作有名称，错误恢复动作可见；读屏未实测。         |
|        6 | 识别而非回忆   |             3/4 | 订单状态与选择数留在页面；搜索入口在窄屏缺失。                   |
|        7 | 灵活与效率     |             3/4 | 支持键盘排序、选择、筛选和横向滚动；移动文档导航效率受限。       |
|        8 | 简洁与审美     |             3/4 | 表格层级、ERP 内容和状态演示清楚；文档壳仍较接近 Dumi 默认风格。 |
|        9 | 错误恢复       |             4/4 | 空、错、加载可恢复；详情关闭、分页和选择的焦点/状态有检查。      |
|       10 | 帮助与文档     |             3/4 | API、使用示例和行为边界充分；密集 API 说明仍增加扫读成本。       |
| **总分** |                | **33/40，Good** | **只评 Table 文档/演示及相关文档壳，不代表全站或整库验收。**     |

### 综合设计结论

- **设计特异性：** Table 演示不是可直接替换到任意产品的占位表格；采购订单、供应商、审批和履约状态使内容贴合 ERP/CRM 工作。文档壳头部的产品个性相对弱，但不影响当前表格任务。
- **做得好的地方：** 表格的筛选、跨页选择、详情、分页及恢复集中在完整业务例子中；窄屏使用有名称、可聚焦的内部滚动区，文档自身无横向溢出；light/dark 与 comfortable/compact 的行高由共享 Token 和测试共同约束。
- **认知负担：** 默认折叠主题设置，首屏以 Table 示例为主；展开设置后品牌色和东方色的选择项各超过 4 个，作为开发者主题试验台尚可接受，但未来可用色板视觉预览或分组降低枚举负担。API 说明概念密度较高，应保留术语并继续用紧邻示例解释，不以删减 API 为手段。
- **情绪路径：** 进入页面后能辨认采购订单任务；选择、筛选、详情和失败恢复提供持续状态反馈。移动端搜索缺失会使读者离开目录后更难抵达目标组件；当前截图曾出现标题接近 sticky 导航的未确认现象，需通过目录链接或键盘跳转复验后才能决定是否记录为缺陷。

### 问题与建议

| 优先级 | 问题与影响                                                                                                                                                                   | 建议                                                                                                                                               |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| P2     | **移动端文档搜索不可达。** Dumi 在 767px 以下隐藏 SearchBar；390px 下没有可见搜索按钮，`Ctrl+K` 也不能打开被隐藏的输入框。读者只能滚动目录查找组件，组件较多时导航成本明显。 | 在项目拥有的 Dumi 文档壳提供可见、可聚焦的移动搜索入口，复用 Dumi 搜索状态和结果；覆盖键盘、触控、明暗模式与 320/390px。建议 `/impeccable adapt`。 |
| P3     | **文档壳品牌识别偏弱。** 当前导航较接近 Dumi 默认样式，站点身份主要由 `lx-ui` 标志和文字承担。                                                                               | 在保持 Read 型文档可扫读的前提下强化 LX 组件库的导航、间距或品牌色细节；先对照产品设计稿再修改。建议 `/impeccable bolder`。                        |

### Persona 红旗与待验证项

- **Alex（熟练用户）：** 桌面有搜索快捷键、表格有键盘排序和选择；手机端没有搜索入口，无法沿用快捷导航。
- **Jordan（初次使用者）：** 采购示例语义具体；`dataIndex`、`render`、`rowKey` 等 API 说明连续出现，第一次阅读需要在概览与 API 表间来回对照。
- **Sam（键盘/低视力用户）：** Table 的命名滚动区可键盘横移、详情可恢复焦点；真实屏幕阅读器、200%/400% 放大及移动搜索键盘路径仍未验证，不能据此宣称完整无障碍通过。
- B 的移动截图在程序化滚动到章节后似乎靠近 sticky 导航，但没有通过目录链接或键盘操作复现；现阶段列为待验证观察，不当作已确认问题。A 提到的 Escape 全局处理也未在本批复现，不作为结论。

### Technical Audit

| 维度       |            分数 | 依据                                                                                  |
| ---------- | --------------: | ------------------------------------------------------------------------------------- |
| 无障碍     |             3/4 | 键盘排序、选择播报、详情焦点恢复和搜索/页脚颜色有证据；屏幕阅读器及高倍放大未验。     |
| 性能       |             3/4 | 没有为主题 Token 增加运行时依赖；本批未测虚拟化大表、真实交互延迟或 Core Web Vitals。 |
| 主题       |             3/4 | 16 组矩阵覆盖明暗和密度；六个基础色与七个东方色的全排列仍未测。                       |
| 响应式     |             3/4 | 1280/930/390/320px 页面无文档级水平溢出；未测 200%/400% 缩放、物理触屏与更多浏览器。  |
| 实现完整性 |             4/4 | detector 无确定性命中；代码复审 GO；组件契约、主题 Token、测试和范围说明相符。        |
| **总分**   | **16/20，Good** | **限定于本批目标；不是发布认证。**                                                    |

工程复审由 `gpt-6-luna max` 完成，结论 GO、无确认的 P0-P2；首轮指出的证据 P3（推算列宽合计与保存宽度不一致、把基础表头和动效时间写成结构化数据已证明）已修订，并通过 follow-up GO。`npm run check` 的 51 个测试文件、412 项测试通过；含 Table 的 jsdom 会打印 AntD 伪元素尺寸测量的未实现提示，但 Vitest 退出码为 0。`npm run check:scaffold` 已通过。浏览器 B 检查了独立 1440×960/390×844 明暗主题、页面宽度、内部横向滚动和控制台；自动化矩阵补充 1280/930/390/320px × light/dark × comfortable/compact 16 组。未测 AntD 5.24.0 最低版本和 React 19 独立消费、固定列宿主组合、虚拟化性能、读屏、缩放及完整色板。

Questions skipped: 当前只有 2 个 Priority Issues，按 Impeccable 规则少于 3 项可跳过定向问题；用户已要求按计划持续实施。

### 后续动作

1. 使用 `/impeccable adapt` 补齐 Dumi 文档壳的移动搜索入口并实测搜索结果路径。
2. 视设计稿决定是否用 `/impeccable bolder` 增强文档壳品牌细节。
3. 对完成的文档壳改动运行 `/impeccable polish`，核对所有视口、主题、焦点与错误状态。

### 2026-10-06 Dumi 移动搜索代码修复

- **范围：** `docs/docs-shell.css` 与 `patches/dumi+2.4.49.patch`。目标是在 767px 以下显示 Dumi 原生搜索输入框，并保持查询、搜索状态和路由行为由 Dumi 管理；不新增运行时 JavaScript。
- **Impeccable：** 当前会话执行 `context.mjs --target docs/docs-shell.css` 和一次 `detect.mjs --json docs/docs-shell.css patches/dumi+2.4.49.patch`；detector 原始输出为 `[]`，只代表没有命中确定性规则，不代表视觉或交互通过。CSS 经 Prettier 格式化，PostCSS 解析成功。
- **静态交互设计：** 搜索输入定位在菜单图标左侧，菜单展开或收起都保留入口；聚焦后展开，失焦时 Dumi 关闭结果，非空查询仍保持可见，清空后收回图标态。Dumi 原生键盘快捷键检查输入矩形，输入现在始终处于可见视口，因此源码路径能够聚焦该输入；这仍是源码推演，尚无真实按键证据。
- **可访问性与颜色：** Dumi `Input` 的 `aria-label` 复用本地化 placeholder 消息。Dumi `SearchResult` 增加 `role="status"`/polite live region，播报加载、结果数、无结果和方向键当前结果标题；不改原有输入焦点、方向键、Enter、Escape 和路由逻辑。浅色 hover/active 使用 `#004b9b`，静态对比白字 8.47:1；暗色保留 Dumi `#00183a` 背景与 `#ccc` 文字，对比度 10.97:1。计算值未从真实浏览器采样。
- **独立复审：** 两轮工程复审指出的 P2（hover/active 对比度）已通过浅色专属覆盖修复；复审发现 Dumi 键盘活动结果原先无读屏状态播报，新增 status live region 后由同一独立代理复审至最终 GO。评审发现的 `title` 不存在问题已改用 Dumi 公共类型中的 `pageTitle`。独立 UX 评审为静态 28/40，认可入口和布局，同时提出非空查询缺少清除按钮、窄屏结果标题/摘要截断降低候选区分度（均记为后续 P2）；该评审没有浏览器证据。
- **工程检查：** `npm run check` 通过（51 个测试文件、412 项测试）；`npm run check:scaffold`、`npm run build:lib`、`npm run build:docs` 与 `git diff --check` 通过；`npm run patch:dumi` 成功对 dumi@2.4.49 应用仓库补丁。测试中存在既有 AntD/jsdom `getComputedStyle(pseudoElt)` 与弃用 API 警告，命令退出码为 0。
- **验收状态：** 最终补丁下 `npm run check`、`check:scaffold`、`build:lib`、`build:docs`、补丁重放、Prettier、PostCSS 和 `git diff --check` 均通过；独立最终 code review 为 GO。项目规则禁止在浏览器安全策略拒绝后通过其它入口或底层浏览器命令绕过，因此未取得截图、视口测量、无障碍树或实际菜单/搜索操作证据。320/390px、light/dark、Tab/Escape、Ctrl+K、触控、结果点击与路由仍留在浏览器矩阵中；本次不宣称视觉验收通过。文档壳品牌识别偏弱的 P3 仍未处理。

### 2026-10-06 Dumi 移动搜索防抖 Polish 复核

- 按 Impeccable 4.1.3 的 `polish` 流程检查当前 CSS、Dumi 补丁、相邻搜索交互与已有 UX 评审。`critique-storage latest docs/docs-shell.css --json` 没有当前可复用快照；本轮独立复核未把 `detect []` 当成设计结论，也未生成新的视觉评分，因为没有真实页面视口证据。
- 代码审查首轮发现 P2：关闭弹窗时用相同关键词调用 setter 会清除延迟中的 Worker 请求，却不改变 `keywords` 状态，导致请求可能永不派发。修复在 `loadSearchData()` 后对同值返回，不动现有计时器；新增测试在防抖中段重复传值，再确认请求只派发一次。P3：`patches/README.md` 未列搜索槽位的升级复验职责，现已补充 SearchBar、SearchResult、useSiteSearch 检查项。指定 `gpt-6-luna max` 代理复审为 GO。
- 之前 Impeccable UX 评审提到的非空查询清除入口和窄屏结果标题/摘要截断已在本批实现；方向键现仅在输入框本身持焦时消费，点击清除或结果后也不会留下错误焦点。自动化不能证明实际触屏、屏幕阅读器和浏览器布局结果。
- 默认无并发上限的全库测试曾在 DynamicForm demo 产生 2 项负载相关失败；该文件独立 12/12 通过，随后以 1–4 worker 跑通全库 54 文件、438 测试。`test`、`test:watch`、`test:coverage` 已固定该并发范围。历史 AntD/jsdom `getComputedStyle(pseudoElt)` 及弃用 API 警告仍出现，但不导致用例失败。
- 最终浏览器验收仍未完成：本会话不能控制视口、键盘/指针，也不能读取无障碍树；不把测试、source review 或包构建写成 UI 通过。文档壳品牌识别 P3 仍是非阻塞后续；全库 2B-1 未关闭。
- **最终工程门禁：** `npm run check` 通过格式、类型、101 个 demo 类型检查、lint 和 54/438 测试；`check:scaffold`、`build:lib`、`build:docs`、`npm pack --dry-run` 通过。补丁使用从 npm tarball 取得的干净 `dumi@2.4.49` 副本，在隔离临时项目中运行 `patch-package --error-on-fail` 并确认同值防抖修复存在。包预览为 522 项、162,924 bytes 压缩、754,772 bytes 解包，docs/tests/UI/.dumi/docs-dist/coverage 禁入路径为 0 项。Dumi 文档站最大共享脚本为 661.35 KB gzip，属于文档构建而非组件库 npm 包。

### 2026-10-06 Dumi 移动搜索窄屏浏览器复核

- **范围：** `docs/docs-shell.css` 的 Dumi 移动搜索覆盖、`tests/browser/search.spec.ts` 与移动搜索验收矩阵。按 Impeccable 4.1.3 使用 `context.mjs --target docs/docs-shell.css`、独立 A 组 UX critique、B 组 detector/浏览器证据，再由当前任务补真实 Playwright polish 复测。A 组静态评分 28/40，快照链接为 [2026-10-06T08-30-28Z__docs-docs-shell-css.md](../.impeccable/critique/2026-10-06T08-30-28Z__docs-docs-shell-css.md)；该组未取得真实浏览器视口证据。
- **技术问题与修复：** 当前源码重新构建后，Chromium 首轮显示 320px 下搜索输入框继承 Dumi 原生移动隐藏状态。定位为本地和后加载 Dumi 规则特异性相同；将 `.dumi-default-header-content` 加到本地选择器提高特异性，不更改布局位置、行为或依赖。随后当前 `docs-dist` 下的 Chromium 与 Edge 均在 320×740、390×844 找到可见且有本地化可访问名称的搜索框，结果面板打开时文档根无横向溢出。
- **交互结果：** 当前源码的 Playwright 搜索用例在两种浏览器各 2/3 通过。`Control+K` 聚焦搜索框、填入 `Table` 后能浏览命名为“搜索结果”的 region；`ArrowDown` 更新第一项 status，`Enter` 打开 Table 文档，旧输入未重新获焦。Escape 关闭结果并保留查询，但在 320/390 下焦点都到 `BODY`；输入框保持焦点的软断言两项均失败。按主代理指示暂不更改 `dumi+2.4.49.patch` 中的主动 blur，待焦点契约复审。
- **独立 B 组范围限制：** B 组的额外交互走查使用 `127.0.0.1:8001` 现存预览，未从当前源代码重新构建；不作为当前源码通过证据。其观察包括 54×44px 触控区域、搜索展开覆盖 H1、`button` 查询显示 34 条结果、ArrowDown 当前结果没有 `aria-activedescendant` 关系及放大镜无障碍名称重复为英文 `Search`。这些后续触控/无障碍问题记录在 [browser-acceptance-matrix.md](./browser-acceptance-matrix.md)，按主代理指示本批不扩改。
- **检测器限制与审计分数：** B 组对 `docs-dist/index.html` 的 detector JSON 为 `[]`，stderr 明确说明解析依赖缺失并降级 regex，不用来证明 CSS 级联或视觉品质。此范围局部技术分数：无障碍 3/4（Escape 焦点缺口及未实测读屏）、性能 4/4（无运行时依赖变化）、主题 2/4（仅默认浅色）、响应式 3/4（320/390 窄屏通过但触控遮挡需复核）、实现完整性 3/4（局部修复有浏览器证据，焦点行为未闭合）。这些分数与 2B-1 全库验收完成无关；未覆盖真实读屏、深色、200%/400% 缩放、设备触控、Safari 和部署站点。

### 2026-10-06 Dumi 移动搜索 Escape 焦点 Polish 收尾

- 按 Impeccable 4.1.3 `polish` 对既有 Dumi 搜索补丁做窄范围修复，保留 Dumi 搜索状态机与文档壳视觉。`context.mjs --target docs/docs-shell.css` 确认这是已有视觉系统的 refinement；`critique-storage latest` 未找到与当前目标内容匹配的可复用快照，因此以真实 Playwright 截图、交互和自动化证据独立检查，不把 detector 的 `[]` 当成结论。
- `gpt-6-luna max` 行为复审为 GO：输入法组合期间 Escape 不冒泡关闭搜索；首次 Escape 隐藏结果并保留输入焦点；再次 Escape 恢复默认失焦行为。新增浏览器断言覆盖第二次 Escape 后失焦，并确认快捷键仍能重新打开结果。移动摘要最多三行的顶栏与弹层 CSS 规则均由单测检查。
- 最终 Playwright 搜索用例在 Chromium 和 Edge 均为 3/3 通过，覆盖 320×740、390×844、快捷键、Escape 两阶段焦点、结果播报与 Enter 导航；`mobile-search.test.tsx` 为 11/11 通过。Chromium 两种窄屏截图已目视检查，页面根无水平溢出，结果摘要保持在三行内。浏览器错误监听在导航前安装，并在请求排空和 1 秒静默后检查；共享负测验证延迟 404 与失败请求。
- Impeccable 本轮结论仅针对移动搜索局部实现。真实读屏、物理触控、Safari、深色主题、高倍缩放和部署环境仍未验收；不据此关闭全库 2B-1。干净 npm tarball 上补丁正向重放成功；裸 `git apply --reverse --check` 对补丁格式差异敏感，后续已用 `--ignore-whitespace --inaccurate-eof` 完成反向检查，不再作为待处理门禁。

### 2026-10-06 Dumi 移动搜索候选数 Polish

- 按 Impeccable 4.1.3 `polish` 对上一轮已建立的 Dumi 搜索体验继续收尾。`critique-storage.mjs latest docs-docs-shell-css --json` 未返回开放快照；历史 A 组 UX critique 中“窄屏可能同时显示超过 4 项”的观察已作为待核风险，用 Chromium/Edge 真实 viewport、候选数量、滚动和截图独立复核，不把 detector 输出当作 UX 结论。
- 将移动结果滚动区最大高度从 460px 限制为 320px，避免窄屏在首屏同时暴露五个以上候选；实际 `button` 查询共 36 项，320×740 显示 3 项，390×844 与 390×450 显示 4 项。三种视口面板高度均为 320px，末项可通过结果区滚动到达；常见宽度的文档根没有横向溢出。
- 折叠搜索入口新增的“搜索”短标签在 320/390px 截图中均可见；结果列表仍保留标题、摘要、分类和 44px 输入框操作区域。首屏结果弹层覆盖部分文档内容是临时搜索状态，Escape 能按两阶段行为收起，不改变页面路由。
- Chromium 和 Edge 搜索浏览器用例各 4/4 通过；包含候选上限、常见/短视口、内部滚动、折叠截图、两阶段 Escape 与 Enter 路由。自动化要求结果至少 20 项、首屏显示 3 至 4 项；当前索引实测 36 项、各视口分别 3/4/4 项。Dumi 生产构建、静态导出检查和两项相关单测组通过。测试期间识别并修复 locale JSX 补丁缺少右括号的问题，干净安装补丁后语法检查和生产构建均通过。
- 复审补充的首屏边界断言已加入：滚动区顶部须 `>= 0`、底部须 `<= viewport.height`，防止面板整体越出上边缘时仍误报候选数量通过；当前 Chromium/Edge 构建均通过此约束。
- Impeccable 局部结论：入口的可发现性、窄屏候选数量与恢复交互已通过当前 viewport 证据；评分仅适用于本次搜索路径，不外推到整个文档站。剩余读屏、真实触控、Safari、深色主题、缩放和部署环境仍未验证；全库 2B-1 保持未关闭。

### 2026-10-06 Space 与 Card 窄屏示例复核

- **范围与方法：** Impeccable 4.1.3；本会话执行 `context.mjs --target docs/demos/general-space-options.tsx`，遵循 `adapt` 与 `craft-floor`。Assessment A 和 B 由隔离的 `gpt-6-luna max` 子代理先后完成，A 首轮发现 Card 标题截断后进行一次修复确认。完整评审记录见 [Space/Card critique snapshot](../.impeccable/critique/2026-10-06T12-20-23Z__docs-demos-general-space-options-tsx.md)。
- **目标与设计判断：** `docs/demos/general-space-options.tsx`、`docs/demos/card.tsx` 及 demo 自有 CSS Modules；组件文档属于 Read 模式。Dumi 外壳较常规，示例文案以采购、供应链风险、外部审计和运营指标体现 ERP/CRM 场景，目标适配度中高。
- **Nielsen 启发式评分：** 系统状态 3/4；现实世界匹配 4/4；用户控制 3/4；一致性 3/4；错误预防 3/4；识别而非记忆 3/4；效率 3/4；简约 3/4；错误恢复 2/4；帮助文档 3/4；总分 30/40（Good，75%）。局部 UX 分数不外推到整个组件库。
- **局部技术审计：** 无障碍 2/4（没有键盘全流程、对比度、axe 或真实读屏证据）；性能 3/4（无依赖和复杂运行逻辑，未测设备性能/Core Web Vitals）；主题 2/4（仅默认外观）；响应式 3/4（4 个视口根节点通过，Card tabs 仍内部横向滚动）；实现完整性 3/4（复现问题、浏览器回归与独立代码审查完成，detector 未扫描 CSS Module）。
- **优先发现：** P1 Space 固定宽预览和 Card 子项最小内容宽度在窄屏造成文档根水平溢出，均已修复并通过全路由矩阵；P1 Card 标题在 320px 下被截断，已改为完整两行，1280px 单行，自动化断言检查真实标题盒的 scroll/client 宽高。P2 混排正文窄列两端对齐扫描性较差；P2 Space 示例代码在 320px 下需横向滚动但无明显提示；P2 Card tabs 可视宽度狭窄并省略部分文字，但所有项可滚动选择；P3 Card 文档小节标题可能形成单字换行。后 4 项未在本批改动，作为后续文档窄屏 polish。
- **真实浏览器与交互：** 独立 Playwright fresh context 检查 320、390、930、1280px。Space 在 320px 下由父级内容宽度约束到 190px，选择 560px 也不会撑宽；桌面保持可调宽度。Card 在 320px 根节点与 body 均为 320px，卡片宽约 190px；标题最终完整且无盒内裁切；三个 tab、加载/完成状态及焦点恢复可操作，页面无浏览器错误。1280px 标题单行。
- **检测器：** `node C:\Users\Administrator\.codex\skills\impeccable\scripts\detect.mjs --json docs/demos/general-space-options.tsx docs/demos/card.tsx` 最终输出 `[]`、退出码 0；只扫描两个 TSX 文件，不包含 CSS Modules、共享 frame、Dumi 文档壳或运行时表现。Assessment B 未注入 live overlay；页面判断来自独立 Playwright，不依据 `[]`。
- **独立复审：** `gpt-6-luna max` code review 最终 GO，无可操作 P0–P2；覆盖 CSS Module 作用域、Card ReactNode 标题、Space 的 `min()` 约束、1500ms 布局轮询 timeout 和标题裁切断言。
- **工程门禁：** `npm run check:scaffold` 通过；`npm run check` 的 Prettier、TypeScript、101 个 demo 类型、ESLint、55 个测试文件/444 个测试全部通过；`npm run build:lib`、`npm run build:docs`、静态导出和 `npm pack --dry-run` 通过。Chromium/Edge 各 38/38 浏览器用例通过。jsdom 对 AntD 伪元素测量及既有弃用 API 的 stderr 警告存在，但没有测试失败。
- **范围结论：** 关闭 Space/Card 根溢出复现和 Card 标题裁切；窄列正文、代码滚动提示和 tab 标签呈现仍有非阻塞 polish 项。未覆盖物理设备、200%/400% 缩放、完整主题/密度、reduced motion 与真实读屏；这项审计不关闭 2B-1 全库组件验收。
- **问题略过：** 本批由现有路线图和已授权的持续验收明确范围，不需要新增产品决策；上述未处理项进入后续窄屏 polish。

### 2026-10-06 Card 标签完整可视性与测试有效性

- **方法与范围：** Impeccable 4.1.3；本会话执行 `context.mjs --target docs/demos/card.tsx` 并读取 `critique`、`audit`、`craft-floor` 与项目级执行规则。目标是 Read 模式的 Card 文档 demo：`docs/demos/card.tsx`、`docs/demos/card.module.css` 和 Card 路由；没有改动发布组件 API。Assessment A/B 使用隔离的 `gpt-6-luna max` 子代理；A 先独立完成，B 后运行 detector 与浏览器 overlay。完整快照见 [Card critique snapshot](../.impeccable/critique/2026-10-06T13-26-02Z__docs-demos-card-tsx.md)。
- **设计特异性与 Nielsen：** 业务文案以采购运营、供应链风险、外部审计呈现 ERP 中后台场景，特异性中高。系统状态 4/4；现实世界 4/4；用户控制 3/4；一致性 3/4；错误预防 3/4；识别而非回忆 4/4；效率 3/4；美学与简约 3/4；错误恢复 3/4；帮助文档 3/4；总分 **33/40（Good）**。认知负荷低，主要 demo 控件数量少；文档外壳导航的同级链接不归 Card 目标缺陷。
- **局部技术审计：** 15/20（Good）：无障碍 3/4（tabs 有名称与键盘语义、状态有播报；未运行 axe 或真实读屏）；性能 3/4（少量内容、无新增依赖，absolute ink-bar 过渡无可见 layout shift；未测真实设备指标）；主题 2/4（本轮只检查默认外观）；响应式 4/4（320–1280px 与断点两侧均无根溢出，文本没有被内部滚动区裁切）；实现完整性 3/4（设计与测试闭环，但完整主题/跨浏览器矩阵未覆盖）。
- **测试审查与返工：** 初版只比较 tab 与外层 `tablist`，且一边测量一边点击，独立 code review 判为 NO-GO。修复后只选择与预期标签文本精确匹配的 Range；从文本节点父级开始检查每一层 overflow client box 及 viewport；点击前先测量三个标签。第二轮独立 code review 为 GO，Card Playwright 用例 1/1 通过。
- **Assessment B 命令与边界：** `node C:\Users\Administrator\.codex\skills\impeccable\scripts\detect.mjs --json F:\work\lz-ui\docs\demos\card.tsx` 原始输出 `[]`、退出码 0。CLI 对单文件 TSX 使用 regex 文本引擎，不跟随 CSS Module，无法检测实际裁切。浏览器注入 overlay 成功；全页 11 组命中分为 cramped-padding 3、line-length 6、layout-transition 2。10 项位于 Dumi TOC、其他示例 Select/说明段落或 body；Card 内唯一命中是 AntD absolute tab indicator 的 `width/left/right` 0.18s 过渡。点击时指示线平滑移动、不改变周边布局；reduced motion 下 computed duration/delay 为 0s，未触发 transition 事件。没有将检测器命中计作修复项或忽略规则。
- **浏览器证据：** Assessment A 的 Chromium 新上下文覆盖 320、360、361、375、387、388、390、930、1280px；Assessment B 另以 320、390、930、1280px 量测标签 Range 与真实 `.ant-tabs-nav-wrap` 及 viewport 裁切边界。四档根节点无横向溢出，三个 tab 均可切换且显示对应内容。390px 下开始加载后出现骨架与 status 文案，完成后内容恢复并将焦点返回开始按钮。浏览器无错误；本批未保存截图，正文记录了可复现路由与文本几何数值。
- **发现状态：** 唯一代码问题 P2 是浏览器断言测量范围不足，已修复并经二次独立复审关闭。没有未解决 P0–P2。detector 的 docs-shell 命中不属于 Card demo；长篇文档的行长需按文档窄屏目标另行复核。
- **未覆盖范围：** 当前只有 Chromium 默认主题视图；未覆盖 Edge/WebKit/Safari、真实读屏、实体触控、200%/400% 缩放、所有 appearance/color/palette/density 组合。Card 局部通过不关闭 2B-1。
- **Questions skipped:** 当前任务按已授权路线只修复测试有效性，没有待定的产品方向需要用户选择。

### 2026-10-07 Table 固定列与虚拟化回归复核

- **目标与方法：** Impeccable 4.1.3，Read 模式；目标为 Table 文档页的固定列/虚拟化 demo、键盘同步和对应 Playwright 几何断言。视觉结构此前由独立 Assessment A 评为 33/40（Good）；沿用当前设计稿、Table 文档和已关闭的 `.impeccable/critique/2026-10-06T15-50-27Z__docs-demos-table-fixed-columns-tsx.md`，未改动组件公开 API。
- **修复与独立复审：** 粗指针测试以浏览器计算的 `outlineWidth + outlineOffset` 再加 4px 安全余量，检查采购员按钮与两侧固定区域的分隔；避免测试仅与当前 AntD 轮廓尺寸偶然一致。独立 `gpt-6-luna max` 代码复审只读检查实现、测试和中文注释，结论与发现记于本批收口记录。
- **Impeccable 结论：** 最终 Nielsen UX 33/40（Good），无 P0/P1。技术审计沿用已关闭快照的局部评分：无障碍 3/4、性能 3/4、主题 2/4、响应式 4/4、实现完整性 4/4，共 16/20；未实测真实读屏、设备帧率与全主题矩阵。Detector 命令 `node C:/Users/Administrator/.codex/skills/impeccable/scripts/detect.mjs --json docs/demos/table-fixed-columns.tsx docs/demos/table-virtual.tsx docs/demos/table-demo.module.css` 原始 stdout 为 `[]`、stderr 为空、退出码 0，只表示扫描范围内没有确定性规则命中。隔离 overlay 曾报告 39 个节点，包含 AntD 固定列与虚拟滚动结构命中；这些结构经公开 API 和几何证据判断，不把 detector 或 overlay 单独当成失败/通过结论。
- **P2 边界：** Ant Design 5.24 没有内建的纯文本单元格方向键导航协议；公开 `onCell` 和自定义 cell 扩展允许宿主自行实现，但不提供完整的 roving focus、焦点恢复或固定列滚动区协调。纯文本格不在 Tab 顺序内；示例没有改写 AntD 私有 DOM，也没有虚构网格导航。后来此范围按 ADR-0005 重分类为已接受语义限制；无 P0/P1 阻断。
- **浏览器与工程门禁：** 隔离验证副本中的 Dumi 生产构建、静态导出检查（158 个 HTML、474 个本地资源引用）、`npm run test:browser:all`（Chromium 42/42、Edge 42/42，合计 84/84）通过；Table 定向浏览器用例 8/8。`npm run check` 为 55 个测试文件、444 项通过；`npm run check:scaffold` 通过，demo 类型检查覆盖 103 个文件。`npm pack --dry-run --json` 当前为 522 个文件，163,495 B 压缩、757,370 B 解包；docs、tests、UI、Dumi 临时产物、coverage 禁入路径为 0 项。首次测试曾有两项 DynamicForm demo 在高负载并行下波动，单独通过后将 worker 限制为 1–4，再次完整测试通过。jsdom 的 AntD scrollbar 伪元素 `getComputedStyle` 警告仍是环境噪声，不影响断言。
- **范围：** 本轮关闭固定列/虚拟化 demo 的浏览器回归有效性和验收状态不一致问题，不代表 Table 完整主题/色板、放大、真实读屏、Safari、实体触控、动态行高、部署环境或全库 2B-1 已关闭。

### 2026-10-07 Table 固定列详情键盘与移动布局

- **目标与设计：** Impeccable 4.1.3，Read 模式；目标是固定列 Table demo 的订单详情读取、键盘焦点和窄屏触控路径。沿用 `UI/P0 基础组件-Data Display/DESIGN.md` 的商务后台表格风格和项目语义 token，不改变 Table 公开 API。主审修复前基线为 22/36（9 项适用）；问题是详情反馈只读出订单编号、采购员、供应商，且没有可关闭详情反馈的控件。方向键浏览纯文本列另列 P2，不由详情面板冒充解决。
- **实施与复审：** 详情改为具名非模态 region，以 `<dl>` 展示订单编号、供应商、所属部门、采购员、日期、金额和审批状态。触发按钮同步 `aria-expanded`/`aria-controls`；打开或切换时聚焦面板标题，关闭时还原到最近的触发按钮。窄屏改为单列并允许供应商长名称换行。首轮独立 `gpt-6-luna max` code review 发现 P2：粗指针关闭按钮低于 44px；已按 `--lx-control-target-touch-min` 修复，并增加真实浏览器尺寸与焦点恢复断言。二轮独立复审 **GO**，无未解决代码 P0–P2。
- **Impeccable 实际检查：** `node C:/Users/Administrator/.codex/skills/impeccable/scripts/detect.mjs --json docs/demos/table-fixed-columns.tsx docs/demos/table-demo.module.css src/components/data-display/table/index.md` 原始 stdout `[]`、stderr 为空、退出码 0；只表示确定性规则未命中。按 polish 对真实页面而非检测器输出作判断：1280×900 两列、390×844 单列；字段与长供应商可读、文档根和面板无横向溢出。标签文字颜色计算样式为 `rgb(65,71,85)`，值文字为 `rgb(11,28,48)`，表面为白色；对比度满足普通文字 AA。无新增动效，页面使用 reduced-motion 模拟仍可完成操作。
- **浏览器证据：** 隔离 worktree Dumi 生产构建与静态导出通过（158 个 HTML 页面、474 个本地 JS/CSS 引用、88 个嵌套 demo 页面）。Playwright Chromium 与 Edge Table 专项各 4/4（合计 8/8）：桌面 Enter 打开后标题获焦，七个字段的 label/value 完整，切换行后内容和展开状态更新，关闭后焦点回到第二行按钮；390px 下长供应商换行、关闭后回焦且文档根无溢出；1000 行虚拟表原有键盘和渲染测试继续通过。粗指针上下文确认 `any-pointer: coarse=true`，关闭按钮实测 64×44px，触控关闭与焦点返回通过；浏览器无 pageerror、console error、requestfailed 或 HTTP 错误。独立浏览器截图和复现步骤位于临时验收 worktree；自动化断言作为持久回归证据保留在 `tests/browser/table-demo.spec.ts`。
- **工程检查：** 主工作区 `npm run check` 通过，55 个测试文件、445 项；同时 `npm run check:scaffold`、`git diff --check` 和修改文件的 Prettier/ESLint、103 个 demo 类型检查通过。jsdom 的 AntD scrollbar pseudo-element `getComputedStyle` 噪声不影响断言。
- **剩余范围：** Table 纯文本单元格没有默认方向键导航；AntD 5.24 没有内建导航协议，但公开 `onCell` 和自定义 cell 扩展可供宿主自行实现。该行为后来按 ADR-0005 记为已接受语义限制，不作为本局部 demo 已解决方向键遍历的证据。真实屏幕阅读器、实体设备、Safari、200%/400% 缩放、完整主题/色板矩阵和部署环境仍未验收；本批不关闭 Table 完整矩阵或全库 2B-1。

### 2026-10-07 Table 订单详情分组与状态一致性复审

- **目标与设计：** Impeccable 4.1.3，Read 模式；复核 `docs/demos/table-fixed-columns.tsx` 的采购订单详情分组、窄屏阅读及表格/详情状态一致性。视觉依据为 `UI/P0 基础组件-Data Display/DESIGN.md`、项目语义 token 和既有 ERP 表格样式。Assessment A、Assessment B 与代码复审均由独立 `gpt-6-luna max` 子代理完成。
- **UX 评审与修复：** 首轮 A 评为 29/36，发现表格“待审/已审”与详情“待审批/已审批”用词不一致（P2）。表格 Tag 改为显示完整状态值，浏览器断言同时检查两种状态在表格行与详情字段中的完整文案。A 组复审确认 P2 关闭、Nielsen 一致性与标准从 3/4 升至 4/4；最终 **30/36（83%，Good）**，第 9 项因静态只读示例无错误恢复路径而不适用。剩余两项 P3 为移动端金额/审批字段需向下浏览，以及阈值说明和滚动提示相邻且部分重复；A 组认为分组仍清晰、两段说明各自解释不同操作，不要求本轮修改。
- **Nielsen 分数：** 系统状态可见 3/4；现实匹配 4/4；控制与自由 3/4；一致性 4/4；错误预防 3/4；识别优于记忆 4/4；灵活效率 3/4；简约审美 3/4；错误恢复 N/A；帮助文档 3/4。认知负荷低，详情字段按“订单信息、采购归属、审批与金额”分成三组，窄屏按相同顺序纵向排列。
- **技术审计：** 无障碍 3/4（命名 region、状态、标题焦点和关闭回焦有断言；真实读屏未测）；性能 3/4（本 demo 数据规模小，无新增动画；未测设备帧率/INP）；主题 2/4（使用语义 token，未覆盖全主题）；响应式 4/4（1280/930/390/320px、长文本、粗指针与页面溢出有浏览器证据）；实现完整性 4/4（保留 AntD 公开 API，没有改组件公开 API）。合计 **16/20，Good**，是 demo 局部评分。
- **Detector 与 overlay：** 唯一最终源码扫描为 `node C:/Users/Administrator/.codex/skills/impeccable/scripts/detect.mjs --json docs/demos/table-fixed-columns.tsx`；stdout `[]`、stderr 为空、退出码 0，仅表示确定性规则没有命中。真实页面 overlay 注入成功，报告 11 个标记组：Dumi 目录、主题设置 Select、AntD Table 容器、AntD 虚拟滚动 holder、折叠主题设置内的选项文字及页面 body 动效规则。目录和 Select 属于文档壳/设置面板；隐藏文字标记由未打开的 details 后代产生；虚拟 holder 的裁切是虚拟化滚动预期；目标 `.ant-table` 的 padding 标记落在 AntD 生成的全宽包装层，实际页面截图未显示目标 demo 被遮挡；body 上的 bounce/layout 规则是文档站全局层级，无法归因到目标详情面板。没有把这些规则当成自动缺陷，也没有添加 ignore 例外。
- **浏览器与工程门禁：** 新建 Playwright context 检查 `http://127.0.0.1:8000/components/data-display/table/`，桌面 1280px 固定列保持 sticky，390px 内部滚动展示操作列，控制台与 page errors 为 0。隔离验证 worktree 的 Chromium 与 Edge Table 专项各 4/4（合计 8/8），包含固定列桌面/窄屏、粗指针 44px 操作目标、虚拟表键盘/播报和滚动至第 1000 行；每项 browser health errors 均为空。隔离 Dumi 生产构建及导出门禁通过，生成 158 个 HTML 页面。主工作区 `npm run check` 通过 55 个测试文件、445 项，`npm run build:lib`、`npm run check:scaffold` 和 `git diff --check` 通过。审查后代码复审 **GO**，没有未解决的本批 P0–P2。
- **未覆盖与后续：** Table 纯文本单元格方向键横向导航仍是单独的 P2；不通过私有 DOM 改写来处理。全主题/色板矩阵、200%/400% 缩放、真实读屏、Safari、实体触控、设备性能与目标部署仍未验收。此局部复审不关闭 Table 全量矩阵或全库 2B-1。下一步继续验证 Table 的风格/主题/密度组合及高倍缩放，再按路线图推进其余组件。

### 2026-10-07 Table 主题/密度与视口等效回归实施记录

- **覆盖实现：** 在 `tokens.test.ts` 增加 156 组公开解析断言（2 明暗 × 3 外观 × 13 配色 × 2 密度），验证 Table body/header 尺寸与密度预期一致，以及正文表面、表头和选中行文字对比度；对比度沿用该文件既有 helper。没有复制 token resolver 的实现。
- **本地命令结果：** `npx vitest run src/theme/__tests__/tokens.test.ts` 通过，1 个文件/244 项；`npm run typecheck` 通过；`npx eslint src/theme/__tests__/tokens.test.ts tests/browser/table-demo.spec.ts` 通过。未在主工作区运行 Dumi 构建或 Playwright。
- **浏览器用例状态：** `table-demo.spec.ts` 已加入通过可访问名称定位的主题设置、明暗 Switch、外观/密度 RadioGroup、品牌色/东方配色 Select 回归；所有 6 个标准色及 7 组东方配色均检查 `data-lx-color`、主色变量、实际表头背景及关键表格计算样式。另加入 640px 与 320px 主 Table CSS viewport 检查根溢出、密度操作、设置 details、订单详情入口和区域内横向滚动。Select 菜单按唯一可访问 listbox 与 option 操作；没有使用 AntD 私有类名或内部状态。
- **执行边界：** 本地尚未执行上述 Playwright 用例；需同步至隔离 worktree 后运行 `npx playwright test tests/browser/table-demo.spec.ts --project=chromium`，届时只记录实际结果。文档术语为“视口等效/窄 CSS viewport 验收（1280px 基准下的 200%/400% reflow 等效）”，不是实际 page zoom。真实 page zoom、读屏、Safari、实体设备、部署环境及完整 156 组合的浏览器交叉测试仍未覆盖；Impeccable 正式评审与独立 code review 由主代理后续执行，本记录不代表它们通过。

### 2026-10-07 Table 主题、密度与粗指针收口复核

- **范围与方法：** Impeccable 4.1.3，Read 模式；目标为 `docs/demos/table.tsx`、Table 适配层、窄屏分页和详情分组。执行 `context.mjs --target docs/demos/table.tsx` 退出码 0，并保存快照 [`2026-10-07T04-35-00Z__docs-demos-table-tsx.md`](../.impeccable/critique/2026-10-07T04-35-00Z__docs-demos-table-tsx.md)。
- **静态扫描边界：** 精确执行 `node C:\Users\Administrator\.codex\skills\impeccable\scripts\detect.mjs --json docs/demos/table.tsx`，原始 stdout 为 `[]`、退出码 0。它只说明 TSX 静态确定性规则未命中，不覆盖 CSS Modules、实际布局、主题切换、动效或交互；本批结论以真实浏览器与测试证据为准。
- **设计结果：** 详情分为“采购信息、履约进度、审批与结算”，窄屏转单列；粗指针下默认/large 非虚拟 Table 的 body/header 行高分别使用基础 token 与 `--lx-control-target-touch-min` 的较大值，纯文本行和表头也达到至少 44px。320px 分页为三行，640px 为两行，摘要和操作保持可见。
- **浏览器证据：** 最新 Dumi 生产构建上 Chromium Table 专项 8/8、Edge Table 专项 8/8；覆盖 6 个标准色、7 组东方配色、三种外观、明暗模式、两种密度、640/320px CSS viewport、详情焦点、固定列、粗指针和 1000 行虚拟滚动。两套均无 pageerror、console error 或 requestfailed。
- **独立 B 组复核：** 使用 127.0.0.1:4199 临时预览采集 1440/640/390/320 细指针与 390/320 粗指针六个场景；每场 response、console、page、request 和 bad response 均为空。各阶段 document/body 的 `scrollWidth` 与 `clientWidth` 相等；640/390 为两行分页、320 为三行分页，粗指针 compact 纯文本行和表头均为 45px。详情的三个分组标题与 `aria-labelledby` 一一对应。独立结论 P0/P1/P2 均为 0、GO；仅记录 demo surface 下方默认白色余量为不阻断的 P3 观察。
- **工程证据：** 全量 Vitest 55 个测试文件、606 项通过；`npm run typecheck`、`typecheck:docs`（103 个 demo 文件）、`lint`、`check:scaffold`、`build:lib` 和 `build:docs` 均通过；静态导出为 158 个 HTML、474 个本地 JS/CSS 引用和 88 个嵌套 demo 页面。Edge 初次连续键盘事件存在偶发少处理一次的时序，测试已改为对具体 Select 控件发送按键后两浏览器复跑通过。
- **未覆盖范围：** 640/320px 是 CSS viewport 的响应式等效检查，不代表真实 page zoom；真实 200%/400% 缩放、屏幕阅读器、Safari、实体设备、设备性能和部署环境仍未验收。纯文本单元格方向键横向导航因 AntD 公开 API 限制继续作为 P2 记录。

### 2026-10-07 全公开路由主题矩阵收口

- **方法与目标：** Impeccable 4.1.3；本批按 Read 模式检查 Dumi 组件文档中的统一主题设置。执行 `node C:\Users\Administrator\.codex\skills\impeccable\scripts\context.mjs --target docs/demos/table.tsx`，上下文确认项目已有 `DESIGN.md` 和 incumbent visual system；没有创建或修改用户已有 `.impeccable/critique` 快照。
- **静态检测边界：** 执行 `node C:\Users\Administrator\.codex\skills\impeccable\scripts\detect.mjs --json docs/demos/table.tsx`，退出码 0，原始 stdout 为 `[]`。该 detector 只表示 TSX 确定性规则没有命中，不扫描 CSS Modules，也不判断真实布局、对比度、动效或交互；本批结论以浏览器矩阵为准。
- **浏览器证据：** `tests/browser/theme-settings.spec.ts` 排除使用独立“显示选项”协议的 DynamicForm 后，Chromium **31/31**、Microsoft Edge **31/31** 通过。每条路由覆盖所有主题 frame 的入口和可见内容，以及首个 frame 的 light/dark、business/soft/glass、comfortable/compact、6 个品牌色、7 个东方配色。930×720、390×844、320×740 下 document/body 根节点无横向溢出；浏览器错误收集器在请求归零并静默后确认 pageerror、console error、requestfailed 与 HTTP 错误均为空。
- **实现审查：** Radio 通过可见标签触发而不是对隐藏 AntD input 做可见性假设；rc-select 通过公开 combobox/listbox/option 语义和键盘操作，首项清除单独处理虚拟列表滚动。Table 的第二个 frame 密度控件用可见“紧凑 · 36px 基础/舒适 · 48px 基础”标签验证，主 Table 的 token snapshot 与完整交互由既有专项用例补充。未读取 AntD 私有 DOM，也未运行时改写 role。
- **结论与边界：** 本批关闭非 DynamicForm 公开路由的统一主题矩阵缺口，未发现 P0/P1；DynamicForm 独立主题矩阵、真实 200%/400% page zoom、真实屏幕阅读器、Safari、实体触控、设备性能与目标部署仍保留。`[]` 不能单独作为视觉通过结论；Table 纯文本格方向键横向导航继续记录为 AntD 公开 API 限制下的 P2。

### 2026-10-07 DynamicForm 独立主题矩阵

- **目标与方法：** Impeccable 4.1.3，Read 模式；目标为 `docs/demos/dynamic-form.tsx` 的客户录入 demo 和折叠的“显示选项”。先执行 `node C:\Users\Administrator\.codex\skills\impeccable\scripts\context.mjs --target docs/demos/dynamic-form.tsx`，随后按 `audit`、`critique`、`polish` 和 `craft-floor` 规则检查层级、控件语义、窄屏布局与主题切换。该 demo 的主题设置协议与通用 `DataDisplayDemoFrame` 不同，使用独立浏览器用例验收。
- **检测器边界：** `node C:\Users\Administrator\.codex\skills\impeccable\scripts\detect.mjs --json docs/demos/dynamic-form.tsx` 原始 stdout 为 `[]`、stderr 为空、退出码 0。它只表示 TSX 静态确定性规则未命中，不扫描 CSS Module，也不判断真实布局、对比度、动效、主题或交互；`[]` 不作为视觉通过结论。
- **浏览器证据：** `tests/browser/dynamic-form-theme.spec.ts` 在 Chromium 与 Microsoft Edge 各通过 **1/1**。用例覆盖 light/dark、business/soft/glass、comfortable/compact、6 个品牌色和 7 个东方配色，验证 `data-lx-*`、`--lx-*` token、完整表单内容以及 930/390/320px CSS viewport 根节点无横向溢出；浏览器错误收集器在静默后为空。
- **交互与层级判断：** 显示选项默认折叠，展开后按外观、主题、密度、品牌色、东方配色和演示失败开关分组；原生 `label`/`select` 保持可访问名称，东方配色与品牌色的清除和恢复行为由公开 `useLxTheme` API 驱动。第二轮 polish 已让摘要显示当前色板，并在展开区提供文字说明和色标；同时用局部 `inline-size` 与 `scroll-margin-block-start` 修复 320/390px 的可用宽度和吸顶栏锚点风险。复核后无 P0/P1/P2 阻断。
- **边界：** 本批关闭 DynamicForm 独立主题矩阵，不关闭全库 2B-1。真实 page zoom 200%/400%、真实屏幕阅读器、Safari、实体触控、设备性能和目标部署环境仍未覆盖。

### 2026-10-07 WebKit 桌面与触控仿真验收

- **目标与设计依据：** 本批只补验收证据，不改变组件视觉或公开 API。目标为 `tests/browser/webkit-smoke.spec.ts`、`tests/browser/touch-smoke.spec.ts` 覆盖的 Table 详情和 DynamicForm 客户录入路径；沿用 `UI/P0 基础组件-Data Display/DESIGN.md` 的中后台表格层级、公开语义和主题 token。Impeccable `context.mjs --target docs/demos/table.tsx` 识别为现有视觉系统的窄范围扩展，允许保留现有实现；项目提供的独立 `audit.mjs` 脚本不存在，因此技术审计按 `docs/impeccable-workflow.md` 的无障碍、响应式、性能、主题和实现完整性维度手工记录，不把缺失脚本当作通过。
- **静态扫描边界：** `node C:\Users\Administrator\.codex\skills\impeccable\scripts\detect.mjs --json tests/browser/touch-smoke.spec.ts` 与 `... tests/browser/webkit-smoke.spec.ts` 均退出码 0、原始 stdout 为 `[]`。该 detector 只表示测试源码没有命中确定性规则，不扫描实际页面 CSS，也不判断触控、浏览器布局或辅助技术。
- **真实浏览器证据：** Windows Playwright WebKit 桌面 smoke 通过 **2/2**；Chromium 与 Microsoft Edge 的 `hasTouch` 触控仿真均通过 **2/2**。WebKit smoke 使用公开 role/name 和 label、原生 `details/summary`、文档化 `data-lx-mode` 标记及真实交互路径，覆盖 930/390/320px 根溢出、Table 详情标题聚焦/关闭和 DynamicForm 主题/重置；触控 smoke 额外覆盖 `locator.tap`、`page.touchscreen.tap`、关闭后的焦点恢复，以及通过可见“重点客户”标签触控选择后负责人字段出现、重置后负责人字段隐藏并恢复普通客户等级。测试不把程序化表单输入或 selectOption 作为触控证据。三组均使用浏览器错误排空器，当前运行没有 pageerror、console error、requestfailed 或 HTTP 错误。
- **独立评审判断：** 触控测试通过独立 Chromium/Edge context 运行，不与 Dumi/AntD 私有 DOM 耦合；WebKit project 只执行桌面 smoke。触控用例按实际 `navigator.maxTouchPoints` 能力决定执行或 skip，并检查 coarse pointer；Chromium/Edge 各 2/2 通过，Windows WebKit 设置 `hasTouch: true` 返回 `maxTouchPoints=0`，因此该 project 为运行时 skip。主要动作使用公开 role/name 和可见文本，并结合原生 `details/summary`、文档化 `data-lx-mode` 标记；该 skip 是环境限制，不能扩展为 Safari 真机或实体设备结论。
- **未覆盖与后续：** 真实 Safari 最近两个大版本、实体触控设备、真实屏幕阅读器、200%/400% page zoom、设备性能/INP 和目标部署仍未验收；Table 纯文本单元格方向键横移仍是 AntD 公开 API 限制下的 P2。当前批无 P0/P1 发现，不关闭全库 2B-1。

### 2026-10-07 Table 基础示例键盘横向滚动与窄屏提示

- **目标与方法：** Impeccable 4.1.3，Read 模式；目标为 `docs/demos/table-basic.tsx` 及其共享滚动区、CSS Module、Table 文档和回归测试。执行 `context.mjs --target docs/demos/table-basic.tsx` 一次，确认沿用现有采购后台设计；按 `audit`、`critique`、`polish` 和 craft floor 完成。本批只改变文档示例，不改变组件公开 API。
- **独立评审：** Assessment A 的 Nielsen 初评为 29/40（Good），十项依次 `3,3,3,3,3,2,3,3,3,3`。A 指出键盘滚动提示缺失的 P2 已补齐并验证；320px 约 190px 内容宽度从 P2 降为 P3，原因是 Dumi demo 外框与 `.surface` 内距，内容仍可通过键盘和触控到达；宽屏无溢出仍保留 region Tab stop 为 P3。A 还观察到从 Dumi 文档起点约需 41 次 Tab，该问题属于全站文档壳，本批没有修改。
- **技术审计：** 局部 16/20（无障碍 3、性能 3、主题 3、响应式 3、实现完整性 4）。region 名称、描述关联、焦点环、修饰键/边界/子控件透传均有证据；没有新增依赖；没有真实读屏、设备性能或完整主题截图证据。
- **静态 detector 与 overlay 边界：** B 组扫描 `table-basic.tsx`、`table-demo-scroll-region.tsx`、`table.tsx` 的原始结果为 `[]`、退出码 0，仅表示 TSX 确定性规则没有命中。Overlay 注入后记录 2 项 `cramped-padding`、4 项 `text-occlusion` 和 1 项 `layout-transition`；四项遮挡位于默认关闭的主题设置内容，其他命中属于 Dumi/共享壳；overlay 自己将 html 滚动宽度从 390px 增至 498px，未按此认定应用横向溢出。
- **修复和二次复审：** 独立代码审查发现 479px CSS 断点与 480px 表格最小宽度之间的次像素空隙。已将容器查询改为严格小于 480px，浏览器测试在 479.5/480px 分别断言提示显示/隐藏；第二轮独立 `gpt-6-luna max` 复审为 GO，无 P0–P2。
- **最终浏览器证据：** 从最新源码完成 Dumi 构建后，完整 `tests/browser/table-demo.spec.ts` 在 Chromium、Microsoft Edge 各 **10/10** 通过。包括 320/390/1280px、方向键起止默认行为、真实 Shift+Tab/Tab 路径、复选框按键透传、`aria-describedby`、479.5/480px 断点、主题、详情、固定列、粗指针和虚拟滚动；错误收集器无浏览器错误。
- **工程门禁：** `npm run check` 通过（55 个测试文件、606 项测试；103 个 demo 类型检查）、`check:scaffold`、`build:lib`、`build:docs` 均通过；静态导出 158 个 HTML、474 个本地资源引用、88 个嵌套 demo。
- **未覆盖：** 真实读屏、实体触控、200%/400% 页面缩放、设备性能和目标部署仍待验收；不关闭全库 2B-1。`detect []` 不作为视觉通过依据。完整证据见 [Table 基础示例 critique snapshot](../.impeccable/critique/2026-10-07T14-18-33Z__docs-demos-table-basic-tsx.md)。

### 2026-10-07 Table 原生键盘模型架构决策

- **范围与 Impeccable 上下文：** Impeccable 4.1.3，Read 模式；执行 `context.mjs --target src/components/data-display/table/index.md`，确认本批沿用既有 Table 文档与视觉系统。变更仅涉及 ADR、组件文档和验收台账，没有改动 JSX、CSS、主题或交互；因此本批不新增 Nielsen 视觉分数、不运行 detector，也不声称产生新的浏览器验收。最近一次真实页面 UX/浏览器证据仍以本文件上方的 Table 基础示例记录为准。
- **独立架构复审：** `gpt-6-luna max` 只读检查 Table 公开类型、AntD 适配层、设计稿、滚动示例和 Playwright 用例。结论为将纯文本单元格方向键导航从 P2 缺陷清单重分类为已接受语义约束；保持静态 Table，不默认增加 `role="grid"`、单元格 tabindex 或焦点管理器。`onCell`、`components.body.cell` 和 `components.body` 是可用于宿主自建行为的公开扩展点，因此不表述为“完全无法实现”；它们并不提供现成的完整 Grid 焦点协议，AntD 也没有直接提供 prop/ref 配置固定列默认内部横向滚动区的名称、焦点或键盘行为。
- **影响与代价：** 普通命名滚动区只提供横向滚动，固定列示例依靠 Tab 可达的行操作和详情面板阅读字段；纯文本格不进入 Tab 顺序。不使用屏幕阅读器的键盘用户不能逐格 Tab 遍历。辅助技术可能提供表格浏览命令，但实际行为取决于浏览器/读屏组合，当前尚未验证。若出现电子表格式操作需求，应另立 opt-in Grid 决策并定义焦点、键盘、控件、虚拟化和读屏协议。
- **状态更新：** 决策、未选方案、优点、代价与重新评估条件见 [ADR-0005](./adr/0005-table-keyboard-model.md)。原 P2 不再列作当前默认 Table 的待修项；本 ADR 不关闭 Table 全矩阵、真实读屏或全库 2B-1。静态文档修改不改变既有 Chromium/Edge 测试结果。

### 2026-10-08 Upload 宿主网络传输示例

- **目标与设计依据：** Impeccable 4.1.3，Read 模式；目标为 `docs/demos/upload-network.tsx`、CSS Module、Upload API 文档和 Playwright 专项。执行 `context.mjs --target docs/demos/upload-network.tsx` 一次，沿用 `UI/P0 基础组件-Form/DESIGN.md` 与 `code.html` 中的拖放区、呼吸图标和文件生命周期设计。网络传输保持默认关闭，后端认证、存储与权限契约归宿主负责。
- **Assessment A：** 独立设计评审为 **34/40（Good）**，十项依次 `4,3,3,4,3,4,3,3,4,3`，低负荷、无 P0/P1/P2。Dumi 930px 首帧曾多约 5px，但属于搜索栏过渡，约 100ms 后稳定为视口宽；320px 目录退出过渡的旧截图稳定后不再遮挡。保留两项 P3：320px demo 宽约 190px、主题色选择可以增加色样。文件选择器由 Playwright filechooser 模拟，不能代表操作系统取消路径。
- **Assessment B 与技术审计：** 独立代码/网络契约结论 GO，没有可复现 P0–P3。局部技术审计 **15/20（Good）**：无障碍 3/4（名称、键盘和焦点有覆盖，原生文件对话框取消未验证）；性能 3/4（transform 动画及 reduced-motion 已实测，生产后端负载未测）；主题 3/4（验证局部暗色，完整密度和色板未覆盖）；响应式 3/4（四种 CSS viewport 无页面根溢出，320px 操作宽度窄）；完整性 3/4（本地、上传、失败恢复与删除路径覆盖，后端生产契约仍由宿主实现）。
- **Impeccable detector 与修复：** 初次扫描报告 `.progressValue` 的 `transition: width`，宽度动画会触发布局计算。填充条现固定 100% 宽并用 `scaleX(percent / 100)` 过渡，`prefers-reduced-motion` 继续关闭过渡；最终 detector 对 TSX 和 CSS Module 输出 `[]`，stderr 为空、退出码 0。该结果只代表确定性规则没有命中。
- **真实浏览器证据：** 最新 Dumi 生产构建在 Chromium 专项 **8/8** 通过，覆盖 multipart mock 上传内容、503 重试、无效服务端地址阻止请求和恢复、远端删除失败恢复、焦点不被异步结果抢回、删除后的焦点恢复、不安全 `fileId`、拖放、键盘选择、暗色和 reduced-motion。1280×720、930×720、390×844、320×740 的 document/body 均无横向溢出；浏览器错误排空没有 pageerror、console error、requestfailed 或非预期 HTTP 错误。限速 8MB mock 下普通模式观测 `aria-valuenow=13` / `scaleX(0.13)` / `0.18s` transition；减少动态效果时为 `aria-valuenow=8` / `scaleX(0.08)` / `0s`，无活动动画。普通模式读取值落在过渡启动帧，未单独测量过渡后的矩阵值。
- **工程门禁：** `npm run check` 通过（55 个测试文件、606 项；104 个 demo 类型检查）；`check:scaffold`、`build:lib`、`build:docs` 通过。Dumi 导出为 160 个 HTML、480 个本地 JS/CSS 引用和 89 个嵌套 demo。独立浏览器评审截图保存在当次本机临时目录；可复现用例为 `tests/browser/upload-network.spec.ts`；完整 A/B 评审快照见 [Upload critique](../.impeccable/critique/2026-10-07T18-42-58Z__docs-demos-upload-network-tsx.md)。因后续补充中文安全边界与性能说明注释，快照由 `critique-storage.mjs` 重新写入并更新目标指纹；注释没有改变 JSX、样式或交互。
- **未覆盖范围：** 请求由 Playwright route mock 截获，不证明生产后端、存储、认证、授权、并发或断点续传；真实系统文件选择器取消、真实读屏器、真实 200%/400% page zoom、实体触控、设备性能及目标部署未验收。该局部结果不关闭全库 2B-1。
- **Questions skipped:** 当前范围和视觉方向已由用户确认；本轮没有待决产品选择。窄屏信息密度和主题色样属于后续 P3 打磨，不阻断此批次。

### 2026-10-08 Table 详情标题窄容器复核

- **目标与设计依据：** Impeccable 4.1.3，`polish`；目标为 `docs/demos/table-fixed-columns.tsx`、`docs/demos/table-demo.module.css`、Table 文档和浏览器回归。遵循 `UI/P0 基础组件-Data Display/DESIGN.md` 及项目主题 token。此前的详情分组已按“审批与金额 → 订单信息 → 采购归属”组织；本轮处理标题中的长订单号在窄容器内拆行并伸出焦点框的问题。会话内已执行一次 `context.mjs --target docs/demos/table-fixed-columns.tsx`，不重复初始化。
- **首轮问题与修复：** Assessment A 在 320px 视口复现 P2：详情宽 190px，标题宽 88px，订单编号宽约 103px，编号伸出标题焦点框并进入关闭操作约 3px。通过 `order-details` 容器查询在内容宽度不高于 220px 时上下排列标题与关闭操作；标题获得完整内容宽度，编号作为不可拆分片段。浏览器测试增加编号在标题盒内、文本不被裁切、与关闭按钮不相交的几何断言。组件说明记录极窄布局规则。
- **独立 Assessment A：** `gpt-6-luna max` 评审以 1440、390、320px 新 Chromium context 检查真实 Dumi 页面。Nielsen 分数为 **30/40（Good）**，十项依次为 `3,4,3,3,3,3,3,3,2,3`。初审指出的 P2 已修复；第二轮为 **GO**：320px 标题框实测 `164 × 48px`，订单号完整落在标题框和焦点轮廓内；标题底边到关闭操作顶边 12px，焦点轮廓外缘仍有 8px 净距。390px 与 1440px 下编号也未与关闭操作相交。打开详情后标题获焦，关闭后焦点回到触发按钮。保留非阻断 P3：桌面有 5 个相同的详情入口；固定列示例的行选择没有配套批量操作，当前作为聚焦详情交互的演示可接受。
- **独立 Assessment B 与代码复审：** `gpt-6-luna max` 最终为 **GO / Approved**，五维 **18/20（Excellent）**：无障碍 3/4、性能 4/4、主题 3/4、响应式 4/4、实现完整性 4/4；未发现可复现 P0–P3。Detector 命令为 `node C:/Users/Administrator/.codex/skills/impeccable/scripts/detect.mjs --json docs/demos/table-fixed-columns.tsx`，原始 stdout `[]`、stderr 空、退出码 0；这仅表示确定性规则未命中，不代表视觉通过。代码复审未发现 AntD 私有 DOM/API 依赖、性能回退或回归测试缺口。
- **真实浏览器证据：** 独立 Chromium 149 新 context 检查 1440、930、390、320px；全部 HTTP 200，页面与详情区无横向溢出，浏览器 page/console/request 错误为空。四档分组顺序一致。320px 下编号完整处于标题焦点框内，关闭按钮在标题下且无相交；键盘 Enter 打开、Tab 到关闭、Enter 关闭后焦点恢复。`npx playwright test tests/browser/table-demo.spec.ts --project=chromium --reporter=line --output <Temp>` 通过 **10/10**。截图目录：`C:\Users\Administrator\AppData\Local\Temp\lx-ui-table-assessment-a-round2-TX1fGz` 与 `C:\Users\Administrator\AppData\Local\Temp\lx-ui-table-assessment-b-20261008`。
- **工程门禁：** 最终 UI 改动后 `npm run check` 通过，55 个测试文件、606 项测试，104 个 Dumi demo 类型检查；`npm run check:scaffold`、`npm run build:lib`、`npm run build:docs` 通过。Dumi 导出 160 个 HTML、480 个本地 JS/CSS 引用、89 个嵌套 demo 页面。详情为文档 demo/CSS 改动，未改变库公开 API。
- **边界：** 此批关闭订单号伸出标题焦点框的 P2，不关闭 Table 全矩阵或全库 2B-1。真实屏幕阅读器、200%/400% page zoom、Safari/实体设备、完整主题与密度矩阵及目标部署仍未在本批复验；下阶段继续按 [browser-acceptance-matrix.md](./browser-acceptance-matrix.md) 处理。双代理复审快照见 [Table critique](../.impeccable/critique/2026-10-07T20-01-30Z__docs-demos-table-fixed-columns-tsx.md)。
- **Questions skipped:** 本轮范围已经由用户授权；当前没有待决产品选择。桌面重复入口和无批量操作为不阻断的演示范围观察。

### 2026-10-08 Alert 交互 Demo 窄屏复审

- **范围与依据：** 目标为 `src/components/feedback/alert/index.module.css`、`src/components/feedback/alert/index.md`、`docs/demos/feedback-alert-interaction.tsx` 与其 CSS Module。依据 Stitch 输入 `UI/P0 基础组件-Feedback/code.html` 的 Alert 语义状态、关闭操作及退出动效；本轮未改公开 API。Impeccable 4.1.3 按 `context.mjs --target docs/demos/feedback-alert-interaction.tsx` 建立会话上下文，并按 `frontend-ui-ux`、`reference/polish.md`、`reference/craft-floor.md` 检查真实页面。
- **首次独立 Assessment A：** `gpt-6-luna max`，Nielsen 33/40（Good），无 P0/P1。两个 P2 均由浏览器复现：320×740 触屏下错误消息宽约 28px、6 行，操作挤占正文；1280×900 fine pointer 下关闭目标仅 16×17px。另确认 demo 应明确重试只切换本地状态，不模拟服务端请求，本批已在文档和可见说明中明确。
- **最终 Assessment A 与 B：** 第二轮独立 UX 评审为 **35/40（Good）**（十项依次 `3,4,3,3,3,4,3,4,3,4`），无 P0–P3；首轮两项 P2 均关闭。技术复审曾指出组件触屏目标不能依赖 demo 样式补齐；现 `index.module.css` 自身按具名按钮选择器为 fine pointer 保证 24×24px、粗指针使用 `--lx-control-target-touch-min` 保证至少 44×44px。最终技术复审为 **17/20（Good），GO**，无遗留 P0–P3；样式不依赖 AntD 私有 class、API 或节点层级。
- **打磨后真实浏览器检查：** Chromium 1280×900、390×844、320×740；初始 error、retry success、结果展开/收起、Tab 顺序、Enter 关闭后焦点恢复、reduced motion 与粗指针 tap 均已执行。320px 下 action 移至 Alert 之后，正文实测宽 90px/两行；Alert 190×62px，action 64×44px；fine pointer close 24×24px，粗指针关闭、action 和 reset 均至少 44×44px。页面根及 body 无横向溢出，pageerror、console error、requestfailed 为 0。最新 Dumi 生产导出上的 Playwright 定向 **4/4** 通过。
- **Impeccable detector：** 最终执行 `node C:/Users/Administrator/.codex/skills/impeccable/scripts/detect.mjs --json docs/demos/feedback-alert-interaction.tsx docs/demos/feedback-alert-interaction.module.css src/components/feedback/alert/index.module.css`，stdout 原样为 `[]`，stderr 为空，退出码 0。它只表明本次确定性静态规则没有命中，不代表设计、CSS、DOM、浏览器或辅助技术审核通过。
- **工程门禁：** `npm run check:scaffold` 通过；`npm run check` 通过（55 个测试文件、606 项；104 个 demo 类型检查）；`npm run build:lib` 和 `npm run build:docs` 通过，Dumi 导出 160 HTML、480 个本地资源引用、89 个 demo；Alert Chromium 专项 4/4 通过。全量测试输出有既有 jsdom 伪元素 `getComputedStyle`、循环引用和 AntD API deprecation stderr 告警，相关测试仍通过。
- **未覆盖：** 完整 Alert 组件级 light/dark、comfortable/compact、business/soft/glass 和全部色板矩阵，真实 200%/400% page zoom、屏幕阅读器、Safari、实体设备、性能剖析和目标部署仍未验收；本批不关闭 Alert 完整矩阵或全库 2B-1。
- **Questions skipped:** 用户已确认本轮继续打磨的方向；当前没有待决产品选择。
- **评审快照：** [Alert 交互 Demo critique](../.impeccable/critique/2026-10-07T21-34-21Z__docs-demos-feedback-alert-interaction-tsx.md)。

### 2026-10-08 Spin loading 交互与重复激活复核

- **目标与设计依据：** Impeccable 4.1.3 `polish`；目标为 `docs/demos/feedback-spin-region.tsx`、`docs/demos/feedback-scenarios.module.css`、`docs/demos/feedback-spin-indicator.tsx`、`docs/docs-shell.css`、Spin 文档及浏览器回归。依据 Stitch `UI/P0 基础组件-Feedback/code.html` 和 `screen.png`。本会话已执行 `context.mjs --target docs/demos/feedback-spin-region.tsx`，按 `frontend-ui-ux`、`reference/polish.md` 和 `reference/craft-floor.md` 验收。
- **首轮复审发现与修复：** 独立代码审查在 loading 按钮 hover 时复现 P2：Ant Design 主按钮规则覆盖了忙碌状态 token，背景/文字变为蓝底白字。通过增加带根状态上下文和 `:not(:disabled)` 的 hover/active 选择器提高 specificity，继续使用主题 token；增加浏览器断言覆盖 rest、hover 和 pressed 三态。第二轮复审确认三态背景 `rgb(243, 248, 254)`、文字 `rgb(97, 107, 120)`、边框 `rgb(114, 119, 134)` 均与解析后的 token 一致，`cursor: wait` 和 `aria-disabled="true"` 保留。最终代码复审 GO，无遗留 P0-P2。
- **Assessment A：** `gpt-6-luna max` 独立评审，设计特异性高，认知负荷低；围绕地区输入、客户数据加载、失败保留与重试成功形成清楚的后台工作流。Nielsen **38/40（Good）**，十项依次为 `4,4,4,4,4,4,3,3,4,4`。优势是筛选留在遮罩外且可操作、焦点与重试路径清楚、状态和粗指针目标有明确反馈。无 P0-P2。P3：loading tip、status、按钮文案重复表达状态；输入“华南”时旧的上海记录仍显示；成功数、单条示例记录及固定同步时间之间存在轻微数据呈现不一致；失败示例未提供原因。评审快照见 [Spin critique](../.impeccable/critique/2026-10-07T23-35-53Z__docs-demos-feedback-spin-region-tsx.md)。
- **局部技术审计：** **17/20（Good）**：无障碍 3/4（标签、landmark、`aria-busy`、独立 status 与焦点保留均有代码和浏览器证据，未做真实读屏）；性能 3/4（无依赖和大规模渲染，单一计时器卸载清理，未测实体设备帧率）；主题 3/4（使用 lx token 并跟随 Dumi 明暗模式，完整主题与密度矩阵未覆盖）；响应式 4/4（桌面、320/390px 粗指针视口无根溢出，触控目标达标）；实现完整性 4/4（无公开 API 变更，锁、失败/重试、清理与视觉交互均有回归证据）。
- **Assessment B 与 detector：** `gpt-6-luna max` 独立复核使用 8006 最新构建和新浏览器上下文；rest、hover、mouse-down 三态样式均匹配 token，未发现其它可操作 P0-P2。命令 `node C:/Users/Administrator/.codex/skills/impeccable/scripts/detect.mjs --json docs/demos/feedback-spin-region.tsx` 的 stdout 原样为 `[]`，stderr 为空、退出码 0。该检测仅表示扫描的 TSX 未命中确定性规则；不扫描 CSS Module，也不能替代浏览器、视觉或读屏检查。没有注入 overlay，页面判断来自真实 DOM 和计算样式。
- **真实浏览器证据：** 最新 Dumi 静态构建上 `npx playwright test tests/browser/spin-demo.spec.ts --project=chromium --reporter=line` **5/5**。覆盖假时钟下 loading 连续两次 Enter 仍先失败、随后单次重试成功；鼠标/键盘重复激活、请求中用户移焦不抢回焦点、hover/pressed token、筛选与 tip 不重叠、失败后值保留、320/390px 粗指针目标与 document/body 无溢出，以及系统 reduced-motion 下默认/自定义指示器停止动画。浏览器错误排空为 0。独立 A 组复核 1280×900 与 390×844；页面路由 200，文档根无横向溢出。
- **工程门禁：** 最终代码修改后 `npm run check` 通过：55 个测试文件、606 项测试，104 个 Dumi 示例源码类型检查；`npm run check:scaffold`、`npm run build:lib`、`npm run build:docs` 均通过。静态导出门禁为 160 个 HTML 页面、480 个本地 JS/CSS 引用和 89 个嵌套 demo。全量测试仍会输出现有 jsdom 伪元素测量、循环引用和 AntD 弃用告警，相关测试均通过。
- **未覆盖范围：** 本批只验收 Spin 文档示例和交互，不代表完整组件库矩阵。真实读屏、实体触控、200%/400% 缩放、Safari、设备性能、全配色/风格/密度组合及目标部署未验证。地区输入与静态示例记录的语义、加载文案冗余和错误原因说明作为 P3 留待后续内容打磨；不阻断本批交付。
- **Questions skipped:** 用户已确认持续实施范围与 UI 方向；P3 是文案与示例数据表达，不需要新的架构或产品决策，本批按现有状态行为交付。

### 2026-10-08 Spin 地区状态、锚点与数据边界最终复审

- **方法与目标：** Impeccable 4.1.3 `polish`；目标为 `docs/demos/feedback-spin-region.tsx`、共享 demo 样式、文档锚点偏移补丁、Spin 文档和 `tests/browser/spin-demo.spec.ts`。沿用 Stitch Feedback 稿及本次已初始化的上下文；本轮 A、B 两组分别复核，B 没有读取 A 的结论。
- **已解决的旧 P3：** 地区输入被明确为本地同步参数；输入华南时加载提示使用提交快照，旧记录在失败时保留，重试成功后显示深圳记录及“刚刚”；未配置地区显示明确空态且不伪造客户数或更新时间。错误说明提供模拟服务原因与恢复动作。加载中的按钮保留稳定操作名称，辅助技术状态与可见 tip 分工，减轻状态文案重复。`__proto__` 等非自有键只能进入空态，不会读取对象原型。
- **Assessment A：** `/root/spin_ux_postpolish` 对 8006 最新 Spin 页面复核，设计特异性高，符合组件文档开发者验证加载与恢复行为的任务。Nielsen **40/40**，十项均 4/4；无 P0-P3。320×740、390×844、1440×1000 锚点跳转后输入与按钮均在首屏，文档根无横向溢出；失败保留数据和更新时间，成功更新示例记录，未知地区明确为无本地样例。认知负荷低；窄屏较长说明需滚动查看是非阻断观察。截图见 [`spin-assessment-20261008-finalcopy`](/C:/Users/Administrator/AppData/Local/Temp/spin-assessment-20261008-finalcopy)。
- **Assessment B：** `/root/spin_impeccable_b_final` 独立技术与浏览器复核 **19/20（Excellent）**：无障碍 3/4、性能 4/4、主题 4/4、响应式 4/4、实现完整性 4/4；没有已验证 P0-P3。无障碍扣分仅因本轮没有计算对比度比值，不代表发现对比度缺陷。8006 页面在 1440×1000、390×844、320×740 下无溢出或浏览器错误；覆盖深色切换、键盘焦点、重试与 `__proto__` 空态。
- **Detector 边界：** Assessment B 对目标 TSX 的 detector 原始 stdout 为 `[]`、stderr 为空、退出码 0。该结果只表示确定性规则没有命中，不扫描 CSS Module，也不代替以上真实浏览器、交互及辅助技术检查。
- **独立代码复审：** 原型属性读取修复结论 GO；输入键通过 `Object.prototype.hasOwnProperty.call` 校验后读取记录。计时器卸载清理、提交地区快照、`aria-busy` 范围、稳定按钮焦点及 reduced-motion 行为均有实现和回归覆盖。最后的 token 一致性与测试稳定性调整经 B 组复审 GO。
- **浏览器与工程门禁：** Chromium `tests/browser/spin-demo.spec.ts` **7/7**；覆盖重复 Enter/鼠标激活、首次失败与重试、空态、锚点滚动安全区、320/390px 粗指针目标、主题状态及 reduced-motion；浏览器错误为 0。提交前复跑发现首项在文档水合前冻结时钟会得到空白页面，reduced-motion 的重试式 CSS 断言也可能跨过 900ms 加载结束；测试改为水合后冻结时钟，并在指示器仍挂载时同步读取计算动画名与活动动画数，最终构建复跑 7/7。`npm run check` 通过：55 个测试文件、606 项测试及 104 个 demo 类型检查；`npm run check:scaffold`、`npm run build:lib`、`npm run build:docs` 通过，Dumi 静态导出 160 个 HTML、480 个本地资源引用和 89 个嵌套 demo。
- **评审快照：** 最新结论保存在 [`Spin post-polish critique`](../.impeccable/critique/2026-10-08T01-17-25Z__docs-demos-feedback-spin-region-tsx.md)；旧的 38/40 快照已由 skill 脚本关闭，保留历史趋势。
- **未覆盖范围：** 没有做真实屏幕阅读器、真实 200%/400% 浏览器缩放、Safari、实体触控设备、设备帧率/性能剖析或目标部署验收；局部 Spin 通过不代表全组件库通过，也不关闭 2B-1。
- **Questions skipped:** 本轮范围、视口和本地模拟边界明确，没有待决产品问题；没有对生产同步服务或真实用户访谈作判断。

### 2026-10-08 Tooltip 方位示例窄屏与鼠标命中收口

- **目标与方法：** Impeccable 4.1.3 `polish`，Read 模式；目标为 `docs/demos/feedback-tooltip-controlled.tsx`、`docs/demos/feedback-tooltip-demo.module.css`、`docs/demos/feedback-tooltip-placements.tsx`、`tests/browser/tooltip-demo.spec.ts` 和浏览器验收矩阵。已在项目根执行本会话唯一一次 `context.mjs --target docs/demos/feedback-tooltip-placements.tsx`，沿用 `DESIGN.md` 的组件文档视觉系统。按 `frontend-ui-ux`、Impeccable `adapt`、`polish` 与 `craft-floor` 检查实际渲染；未修改 Tooltip 运行时组件、公开 API 或新增依赖。
- **问题与修复：** 受控 demo 在 320/390px 下让局部 portal 独占一行、对齐触发器并建立局部定位上下文，避免 right 提示覆盖开关或越界。独立 UX 首轮评审（`gpt-6-luna max`）为 **37/40**，发现 P2：左右侧向方位在中间和桌面宽度并排，已打开提示覆盖相邻按钮鼠标命中区。左右组现采用单列；右侧组按钮左对齐、左侧组按钮右对齐，单个按钮限制在 120px。独立代码复审发现测试起初只检查目标中心，最终回归增加稳定几何等待、弹层与目标按钮矩形不相交、`elementFromPoint` 中心命中和真实 hover；每个视口/方向场景重新加载路由以隔离离场动画。复审另发现 reduced-motion 时长/名称断言可能只检查列表中的一个值，现要求所有 transition/animation 时长均为零且所有 animation 名均为 `none`。
- **最终评审：** Assessment A 在 1280×900、930×900、390×800、320×800 最新静态页面复评为 **39/40（Good）**，十项 Nielsen 分数依次为 `4,4,4,4,4,4,4,3,4,4`，无遗留 P0–P3；美观与简约 3/4 是组件文档整体内容密度观察，不是本批回归。四个视口中 8/8 个左右相邻场景没有重叠且可实际 hover；12 个公开位置通过 48/48 次键盘聚焦打开。最终独立代码复审为 **GO**，两项测试精度 P3 均关闭，未发现新问题。局部技术评分 **18/20**：无障碍 3/4（键盘、ARIA 与 reduced-motion 有浏览器断言，真实读屏未测）；性能 4/4（仅文档 demo/CSS 与测试改动，无依赖或运行时成本）；主题 3/4（沿用现有语义 token，未复测完整主题矩阵）；响应式 4/4（四种 viewport 有无溢出和鼠标命中实证）；实现完整性 4/4（无公开 API 变更，测试使用公开 role、ARIA 关系和元素几何，不读取 AntD 私有 DOM）。
- **真实浏览器证据：** 最新 Dumi 静态导出 `http://127.0.0.1:8007/components/feedback/tooltip/` 在 Chromium 与 Edge 定向测试各 **6/6**（合计 12/12），browser-health 收集的 pageerror、console error、requestfailed 和 HTTP 错误为 0。覆盖描述 ID 合并/恢复、受控开关、12 方位桌面锚定、相邻鼠标目标、320/390px 自动翻转和系统 reduced-motion 仿真。四个评审视口的文档根无水平溢出；390/320px 方位组纵向阅读，1280/930px 分组保持桌面网格。截图目录为 `C:\Users\Administrator\.codex\visualizations\2026\10\08\tooltip-review-final\8007`。
- **Impeccable detector：** 最终命令 `node C:\Users\Administrator\.codex\skills\impeccable\scripts\detect.mjs --json docs/demos/feedback-tooltip-controlled.tsx docs/demos/feedback-tooltip-demo.module.css docs/demos/feedback-tooltip-placements.tsx tests/browser/tooltip-demo.spec.ts` 原始 stdout 为 `[]`、退出码 0。该静态 detector 只表示扫描目标没有命中确定性规则，不评估视觉、真实鼠标路径、主题或辅助技术；通过依据来自上述独立复评、实际浏览器和回归测试，不把 `[]` 当作 Impeccable 结论。
- **构建与工程门禁：** `npm run check:scaffold`、`npm run build:lib`、`npm run build:docs` 与最终 `npm run check` 均通过；全库检查为 55 个测试文件、606 项测试、104 个 Dumi demo 类型检查。文档导出为 160 个 HTML 页面、480 个本地 JS/CSS 引用和 89 个嵌套 demo。修改文件已定向运行 Prettier；`git diff --check` 无空白错误。全量 Vitest 会输出既有 jsdom 伪元素 `getComputedStyle`、循环引用及 AntD 弃用提示，测试结果不受影响。
- **边界：** Escape 按用户决定留待 2B-2 锚定对话框统一设计，本批没有实现或断言 Tooltip Escape 行为。没有实测真实操作系统/设备 reduced-motion、Safari、真实读屏、200%/400% page zoom、实体设备、设备性能或完整主题/风格/密度/色板矩阵；本批只收口 Tooltip 文档交互局部，不关闭 Tooltip 完整矩阵或全库 2B-1。
- **Questions skipped:** 用户已明确 Escape 延期且当前工作范围为 Tooltip 窄屏修复；没有待决的产品行为问题。
