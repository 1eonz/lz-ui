# lx-ui 项目开发规则

这份文件是 lx-ui 的强制工程规则。它把产品约束、设计交付、架构边界、代码写法、性能、可访问性、测试和协作流程写成可执行的检查项。规则适用于人工开发、子代理开发和自动化脚本。

## 1. 产品和技术边界

- 目标产品是 React PC 中后台组件库，优先服务 ERP、CRM、商城运营、供应链、客服和数据管理页面。
- 首版重点是高频表单、筛选、表格、反馈、布局和业务组合；Vue、React Native、移动端原生组件、图表、富文本和完整低代码引擎不进入首版。
- React peer 范围固定为 `>=18 <20`，重点验证 React 18/19。不得为了旧项目兼容把新 API 降级到 React 16 语义。
- Ant Design `>=5.24 <6` 是 peer dependency 和能力底座。主包不兼容 Ant Design 4；确有需求时另建 `lx-ui-antd4-compat`。最低版本类型与运行时需单独验证，不能只检查当前安装版本。
- 旧项目 `D:\lxy\crm\lxComponent` 只读参考，不修改、不复制实现、不复制其依赖和私有 DOM 选择器。
- 允许吸收旧项目的职责拆分、组件相邻文档、`quick-field` 的展示/编辑分层、表格子模块拆分和树形数据处理经验。

## 2. 设计门禁和实施顺序

### 2.1 设计证据

组件开始编码前，必须在 `UI/` 找到对应设计稿或设计评审记录，至少包含：用途、尺寸、token、状态、键盘行为、错误和空状态、动画、明暗、密度和响应式边界。缺少一项时只能做类型、工具、文档或测试基础设施，不能凭感觉补视觉。

Stitch 的 `code.html`、截图和 Tailwind 配置是视觉参考，不是运行时代码。不得把 Tailwind CDN、Google Fonts、Material Symbols CDN、演示 `alert` 或硬编码颜色复制进组件包。

### 2.2 固定实现顺序

```text
主题运行时和 token
  -> General 和表单基础控件
  -> FormItem 等表单公共层
  -> DynamicForm
  -> Data Display / Feedback / Navigation / Layout
  -> SearchForm / QuickField / PageContainer
  -> ProTable
  -> P1 虚拟表格、可编辑表格、批量导入等
```

DynamicForm 只能组合公开的表单基础控件。它负责 schema、联动、校验、提交值和渲染器注册，不负责请求、权限、路由和具体品牌视觉。

### 2.3 设计决策版本

- `colorPreset` 保留 6 个稳定品牌色：`blue`、`orange`、`green`、`purple`、`cyan`、`rose`。
- `palettePreset` 独立承载 7 套东方色系，不把 13 个值塞进一个枚举。
- `appearance` 为 `business`、`soft`、`glass`；`mode` 为 `light`、`dark`、`system`；`density` 为 `comfortable`、`compact`。
- 控件高度和表格行高是两套 token。comfortable/compact 不得直接覆盖表格的独立 row height。
- Glass 是渐进增强。`backdrop-filter` 不可用或低性能时回退到不透明表面；关键表单、表格、焦点环和错误提示必须保持可读。

## 3. 架构和依赖方向

- 同一工作区只运行一个 Dumi 开发实例，因为多个实例共用 `.dumi/tmp` 生成目录。出现 `@@/dumi/meta/runtime.ts` 等生成模块无法解析时，先确认对应生成文件存在并停止重复实例，再重启单个 `npm run dev` 服务，通过目标文档路由和浏览器控制台确认恢复。

依赖只能从上到下：

```text
公开入口
  -> business/composite
  -> layout/form/data/feedback/navigation primitives
  -> theme/styles/utils/adapter
  -> React + Ant Design 5 peer dependencies
```

- `theme` 只负责 token、模式、持久化、SSR 安全和 AntD token 映射，不知道路由、请求、权限和业务状态。
- 基础组件不能导入 `business`；DynamicForm 不能导入 ProTable；SearchForm 的 URL adapter 不能进入通用 form core。
- 业务请求、权限、路由和 store 由宿主传入，核心组件不能直接依赖业务项目对象。
- 主入口显式导出稳定 API，不使用长期通配符导出。AntD 原生组件只从 `lx-ui/antd` 显式转出。
- 组件内部文件可以移动；只有稳定类型、组件、必要工具和经过评审的 CSS 变量才可以进入公开出口。
- 新依赖必须记录功能收益、包体影响、维护风险和不引入它的替代方案。React、ReactDOM、AntD 不得打入普通 npm 运行时产物。
- 第三方依赖补丁只允许修正文档站等开发期基础设施的明确缺陷，不得把补丁实现带入 `dist`。补丁必须由 `patch-package` 生成并提交在 `patches/`，对应依赖版本必须固定；`dev`、`dev:docs` 和 `build:docs` 在启动 Dumi 前调用 `patch:dumi` 重放补丁。不要用 `postinstall` 应用开发依赖补丁，以免省略 devDependencies 的组件库消费者安装失败。新增补丁依赖时须在 `patches/README.md` 记录收益、对发布产物的影响、维护风险和替代方案。升级依赖时先重放补丁并检查差异是否仍适用，随后执行干净安装、文档开发/构建与真实浏览器验收；上游已修复时删除补丁和相应维护说明，避免长期保留过时代码。

## 4. 代码和目录规则

### 4.1 组件目录

每个真实组件必须包含：

```text
component-name/
├─ index.tsx
├─ index.module.css
├─ index.md
├─ types.ts
├─ utils.ts                 # 只有纯逻辑确实跨文件时创建
└─ __tests__/
   ├─ index.test.tsx
   └─ accessibility.test.tsx    # 有新交互模式时必须补充
```

- 目录使用 kebab-case，组件和 Props 使用 PascalCase，变量和函数使用 camelCase。
- 公开组件使用命名导出；需要 ref 时使用 `forwardRef` 并导出准确的 ref 类型。
- TypeScript strict、`forceConsistentCasingInFileNames` 必须保持开启；禁止用 `any` 逃避类型设计。
- 优先语义 HTML 和 AntD 公共 API，不依赖 `.ant-*` 私有结构；适配差异集中在 adapter。
- 库运行时样式必须使用 CSS Modules；全局 token/CSS 只放在 `src/styles`，并通过 cascade layer 管理。Dumi 文档壳的第三方样式覆盖可单独放在 `docs/`，不得引入 npm 库样式。
- 颜色、间距、圆角、阴影、控件高度、表格行高、z-index 和动画时长必须来自 `--lx-*` token，不得在组件里重复魔法值。
- 使用逻辑属性，例如 `margin-inline`、`padding-block`、`inset-inline-start`，为 RTL 留出空间。

### 4.2 代码注释和 JSDoc

“详细备注”是强制要求，但备注必须解释选择，而不是重复代码字面：

- 所有自有代码注释和 JSDoc 使用中文，涵盖运行时、类型、CSS、测试、Dumi 示例、脚本和配置。保留必要的 API 名、标准术语、网址和工具指令（例如 `@vitest-environment`）；不翻译变量或属性名，不改写第三方依赖、生成产物和只读 `UI/` 输入。旧英文注释需逐模块转换并核对含义，不通过删除必要说明满足要求。
- 每个公开组件、Props、ref、schema 类型、渲染器注册函数和非显然的工具函数必须有 JSDoc，写用途、适用场景、边界和代价。
- 公开 Props 的字段如有非显然默认值、受控/非受控差异、优先级或副作用，必须逐项注释；简单透传的 AntD 字段可引用 AntD 公共类型，避免复制整套注释。
- 对事件回调写清触发时机、参数形状和是否在程序化赋值时触发；对 Promise 写清失败、取消和竞态语义；对 ref 写清生命周期与可调用条件。
- 复杂逻辑前写短注释，至少说明为什么这样做、处理了什么竞态/兼容问题、有什么取舍。
- 异步请求必须注明取消、竞态、缓存和错误回退策略；主题运行时必须注明 SSR、storage 失败和 hydration 风险。
- CSS 中的非显然规则必须说明 token 来源、可访问性原因、浏览器回退或 reduced-motion 行为。
- 禁止逐行翻译代码的空注释，例如“设置宽度”“赋值给变量”。
- TODO 必须写负责人或 issue、原因和完成条件；不得留下没有上下文的 TODO。
- 注释中的示例必须能通过 typecheck，不能展示已经废弃的 API。
- 注释必须与实现和 `index.md` 同步更新。Review 时把公开 API、异步路径、数据保留、依赖边界和性能取舍逐项核对，不以注释行数或中文长度作为质量指标。

推荐写法：

```ts
// 用 requestId 和 AbortController 双重保护异步选项：取消只能阻止可取消请求，
// requestId 还能挡住不支持 AbortSignal 的旧适配器回写过期结果。代价是每个字段保留
// 一份短生命周期的控制器和计数器，换来搜索输入快速变化时的确定性。
```

## 5. DynamicForm 强制协议

- schema 必须使用 discriminated union；`key` 是稳定渲染身份，`name` 是值路径，二者不能混为一谈。
- `name` 支持字符串、数字和数组路径；数组、对象字段的读写必须使用路径工具，不能用 `Object.entries` 拼接顶层 key。
- 首版字段包括 text、textarea、number、select、date、dateRange、checkbox、radio、switch、upload 和 custom。
- custom renderer 优先使用 registry key，函数 renderer 只作为运行时逃生口，不能进入需持久化的 JSON schema。
- registry 必须支持局部实例注册；全局注册只作为显式、兼容的默认入口，不能在 render 期间修改。
- 受控模式使用 `value/onChange`，非受控模式使用 `defaultValue`；`onChange` 同时返回 changed values 和 all values。
- 条件显示首版只接受同步纯函数。异步可见条件要有 pending 语义，不能隐式改变布局和校验顺序。
- 隐藏字段必须明确 `preserve` 和 `omitHidden`；默认保留值，但提交是否包含隐藏字段必须由 API 决定，不能让业务猜测。
- 规则支持 required、AntD 公开规则和带 `AbortSignal` 的异步 validator。旧校验不能覆盖新值的结果，提交时必须取消或忽略过期校验。
- 异步 options 必须支持 loading、empty、error、AbortSignal、requestId；value 只存值，不把选项列表塞入表单值。
- 字段 renderer 应尽量按字段隔离重渲染；大表单不能因为一个字段变化而无条件重建整棵组件树。
- 如果 `Form.Item` 的直接子节点是封装组件，该组件必须把 `value`、`checked`、`onChange`、`id` 等受控属性继续传给实际输入控件；否则视觉交互会发生但表单状态、联动与校验不会更新。必须有交互测试覆盖这一层转发。
- 表单必须有真实 label、可见焦点、键盘顺序、错误播报、loading/empty/error/disabled/read-only 状态；颜色不能是唯一状态信号。

## 6. 主题、动效和可访问性

- token 分为原始、语义、组件三层；组件只消费语义/组件 token，不读取具体品牌色值。
- light/dark 使用独立表面、边框、文本和阴影映射，禁止简单颜色反转。
- 运行时主题切换必须 SSR 安全，storage 不可用时回退默认值，并避免 hydration mismatch 和明显闪烁。
- 动效主要使用 transform/opacity，通常 150–300ms；必须提供 `prefers-reduced-motion` 静态回退，不得用闪烁表达状态。
- 每个交互元素必须能键盘操作，`:focus-visible` 清晰可见；交互目标优先达到 44×44 CSS px，最低不小于 24×24。
- 焦点轮廓属于实际可聚焦控件。AntD 已绘制聚焦边框/阴影的组件，通过 `ConfigProvider` 公开 token 统一颜色；禁止再给高度、圆角或范围不同的包装层添加 `:focus-within` 外框。新增焦点样式要同时检查鼠标、键盘、明暗主题及真实圆角，避免两层蓝框和偏移间隙。
- 正常文本对比度至少 4.5:1，较大文本和有意义边界至少 3:1。暗色、玻璃风格和 7 套东方色系都要单独检查。
- 表单错误靠近字段、说明发生了什么和下一步怎么修复；加载、空数据和失败状态必须有恢复路径。

## 7. 性能和包体

- 组件按入口和 route 使用；不要默认加载整套图标、locale、日期适配器或 P1 能力。
- 大量列表和表格必须稳定 `rowKey`、memo cell/row、避免每次 render 创建闭包；虚拟化为可选能力，不无条件引入。
- 异步搜索要 debounce，组件卸载要取消请求，定时器、监听器和订阅必须清理。
- 目标是 LCP ≤ 2.5s、INP ≤ 200ms、CLS ≤ 0.1；图片、嵌入和动态区域要预留尺寸。
- 每次发布检查 ESM、CJS、d.ts、CSS、UMD 的体积和 exports；普通 npm 产物不得包含 Dumi demo、examples 或测试代码。

## 8. 文档、测试和验收

- 每个组件文档必须说明用途、不适用场景、基础/受控/非受控示例、主题/密度、loading/empty/error、键盘、Props、ref、边界和性能注意事项。
- Dumi 的 `locales` 只列出已有完整翻译和对应文档路由的语言；翻译未覆盖时隐藏切换入口，不能生成会落入 404 的语言链接。
- 测试验证公开行为，不测试私有 state 名称或 AntD 私有 DOM 层级。
- 新交互至少覆盖默认、受控、disabled、loading、error、empty、keyboard、reduced-motion 相关行为；异步逻辑覆盖竞态和卸载取消。
- 组件完成前必须通过 `npm run check:scaffold`、`npm run format:check`、`npm run typecheck`、`npm run lint`、`npm test`、`npm run build:lib` 和 `npm run build:docs`。
- 格式化只写本次修改的文件；`UI/`、旧项目、构建产物和 lockfile 不允许被全仓格式化波及。`npm run format:check` 是只读门禁。
- UI 变更必须在真实浏览器中检查 light/dark、compact、窄屏、长文本、键盘 focus、错误和 reduced motion；只读代码检查不能代替浏览器验证。
- Impeccable 必须按 `docs/impeccable-workflow.md` 执行 `context -> audit -> critique -> polish` 并记录证据。`detect.mjs` 的 `[]` 只表示确定性规则未命中，绝不作为界面通过的依据；浏览器扫描工具不可用时记录限制并用可运行页面手工验证。
- 公开 API、token、依赖、peer 范围或构建出口变更必须更新 `design.md`、相关 ADR、CHANGELOG 和迁移说明。
- 记录每批交付的设计证据、已验证状态、未覆盖状态及包体变化。未通过验证的能力不能在文档或发布说明中写成“已支持”。

### 8.1 交互式锚定弹层

- `Tooltip` 只表达简短、非交互说明，默认由 hover 和 focus 触发；它不承载链接、按钮或表单，也不替静态子元素补键盘焦点。
- 交互式 `Popover` 和 `Popconfirm` 必须等待锚定对话框原语完成 API、焦点、键盘、读屏、SSR 和定位边界评审。实现只能依赖公开 API，不查询 AntD 私有 DOM，不在运行时改写原生角色；不能用 `aria-expanded` 冒充 Dialog 状态。
- 新原语至少说明 dialog 语义、触发锚点关联、初始焦点、Escape 与外部关闭、关闭后的焦点恢复、受控/非受控模式、嵌套 Provider 和窄屏边界，再开放相应组件目录与公开出口。

## 9. 协作和 Review 流程

复杂任务先写拆分计划、依赖关系、风险和验收标准，再并行分配互不冲突的子任务。机械化子代理只负责边界清晰的代码；涉及公开 API、架构、schema、主题和性能的决策必须由主代理 review。

### 9.1 模型和独立复审约束（2026-10-06 更新）

- 用户于 2026-10-06 最新指定子代理使用 `gpt-6-luna`，思考强度统一为 `max`，覆盖实施、证据整理、UX 评审和独立代码复审；此配置覆盖此前的模型与强度配置。模型服务不可用时记录准确错误和未完成范围，不自动切换模型，也不能把失败请求记成独立复审通过。历史交付记录中的模型名只说明当时流程，不覆盖当前指令。
- 一批代码交付后由独立代理检查设计对应关系、公开 API、交互状态、无障碍、SSR、ref、性能、注释和测试。主代理逐条评估意见，将采纳项及依据派回实施代理；修复后由独立代理复审，问题关闭后再推进下一批。
- 代码审查 GO 只覆盖其明确列出的代码范围。视觉 GO 另需真实页面、设计映射和浏览器证据；不能把构建成功、源码审查或检测器空结果扩展为完整设计验收。
- 每个组件文档必须挂载可运行的 Dumi demo。受控示例必须实现对应更新回调，演示按钮必须有真实动作，异步示例必须能重现失败、重试和数据保留。纯代码示例可补充 API，但不能代替组件实际渲染。
- 组件文档按 AntD 官网的方式拆分场景：基础使用、尺寸与布局、状态、受控交互、扩展用法、主题与可访问性，各场景提供单组件可运行 demo 和完整源代码。补齐 Props 表（类型、默认值、说明）、事件触发、ref、使用边界及性能注意；综合业务 demo 作为补充，不能替代单组件页面。默认值必须与代码一致，未公开的静态成员不能出现在用法中。
- 对 UI 稿缺失或与可访问性冲突的状态，先记录设计依据、采用方案和代价，再验证；不得通过“沿用 AntD”省略与稿件的尺寸、边框、图标、动效、间距和密度比较。
- 模型或工具不可用时记录错误与未完成范围，不将失败请求当作审查通过，也不擅自切换用户排除的模型。

### 9.2 每批执行闭环

每个子代理交付后固定执行：

1. 读取并应用 `frontend-ui-ux` 和 `impeccable` 相关规则，按 `docs/impeccable-workflow.md` 留下每阶段的实际证据。
2. 运行格式、类型、lint、测试和构建检查。
3. 在浏览器中查看实际渲染，检查焦点、文字溢出、暗色、紧凑密度和动效降级。
4. 列出问题并返工，直到主代理 review 通过；不能用“后续再优化”替代当前门禁。

主代理负责合并边界、检查依赖方向、审核公共 API、检查注释和文档、验证包体，并决定是否允许进入公开出口。发现测试失败、设计冲突、无障碍缺失或包体异常时，必须返工后再继续下一批。

Review 至少回答：为何存在这个抽象；业务项目如何扩展；受控、异步、卸载和 SSR 时会怎样；是否依赖 AntD 私有实现；新增代码与样式如何影响打包；失败时用户如何恢复。结论与证据记录在本批设计评审或交付记录中。

## 10. 提交前命令

```text
npm run check:scaffold
npm run format:check
npm run typecheck
npm run typecheck:docs
npm run lint
npm test
npm run build:lib
npm run build:docs
```

完整发布前还要执行 `npm run build`、`npm pack --dry-run` 和 `npm run release:guard`，并确认没有修改 `D:\lxy\crm\lxComponent`。

## 11. 自动格式化、提交与推送（2026-09-30）

用户授权每批完成后自动提交及推送。顺序固定为：本批文件 Prettier 写入、Impeccable 实际审查、独立 code review、修改、独立复审、工程门禁、审阅 git diff、Conventional Commit、普通 push 到当前分支的远程跟踪分支。提交说明使用中文，准确说明范围和兼容影响。

只 stage 当前批次已经检查的文件。既有未提交工作需先理解并纳入对应验收，不能使用全仓格式化或 `git add .` 混入无关文件。`UI/` 和旧项目保持只读。并发代理仍在写入的文件不进入提交；格式化在实现停止后执行，避免与写入互相覆盖。

有代码、类型、测试或独立 review 未关闭的问题时继续修复，不提前提交。浏览器策略限制必须单独记入审查与交付记录，提交只保存已核验的工程范围，不表示完整视觉通过。推送失败保留本地提交并报告实际原因；不 force push、不修改远程权限、不将发布包或 npm publish 等同于 git push。
