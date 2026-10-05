# ADR-0004：可访问的锚定对话框与统一 Escape 协议

## 状态

**架构决定已接受；代码实现等待批次 2B-1 关闭。** 本 ADR 不增加公开组件、导出或运行时依赖。实现时须按本文协议和包体门槛复审。

## 背景

`Tooltip` 用于短小、非交互说明，使用 `role="tooltip"` 和 `aria-describedby`。`Popover`、`Popconfirm` 可包含按钮、链接和表单控件，不能沿用 Tooltip 的语义。Ant Design 5 的公开 Popover API 没有提供可配置 dialog 角色、非模态焦点策略和本项目所需的嵌套 Escape 协议；读取其私有 DOM 或运行时覆盖 role 又违反项目规则。

Feedback 设计稿已经提供 Popover、Popconfirm 与 Tooltip 的静态外观示例，但没有描述焦点进入/恢复、Escape、外部点击、嵌套和 SSR 状态。此 ADR 记录在不改变已接受视觉方向的前提下所需的可访问行为补充。

## 决定

### 实现边界

- 使用 `@floating-ui/react` 的公开 React API 作为内部定位、portal、焦点管理和嵌套浮层基础。当前评估版本为 `0.27.20`，许可证为 MIT，React/ReactDOM peer 范围为 `>=17`；与 lx-ui 的 React 18/19 范围相容。
- 实现阶段将其作为 lx-ui 的直接生产依赖，锁文件固定实际解析版本。不能把 lockfile 中其他包的 Floating UI 传递依赖当作本库已有依赖，也不能改为依赖 Ant Design 的 `rc-*` 传递包。
- 只使用 `@floating-ui/react` 的公开接口。定位由 `useFloating` 与 `offset`、`flip`、`shift`、`autoUpdate` 等能力完成；portal 与焦点管理由公开组件管理。浮层的最终语义由 lx-ui 在 JSX 中明确声明，不依赖工具库默认 role。
- 新建的锚定对话框原语只放在内部目录，由 `Popover`、`Popconfirm` 等公开组件组合；本批不导出通用 `AnchorDialog`、Floating UI 类型或内部 manager。公开 placement 和行为类型由 lx-ui 自己定义，声明文件不泄漏 Floating UI 类型。
- Tooltip 继续使用 Ant Design 5 的公开组件 API，不迁移其定位实现。所有 lx-ui 的 Tooltip 与交互式对话框共用一个私有 Escape 协调器，避免两套实现各自监听 Escape 时同时关闭。

### DOM 与 ARIA 契约

- 锚点必须是单个真实、可聚焦的交互元素；ref 和事件处理器与宿主属性合并，不能丢弃宿主的 click、focus 或 ref 行为。组件不把静态元素偷偷变成新的 tab stop。
- 锚点在打开期间具有 `aria-haspopup="dialog"`、准确的 `aria-expanded` 和指向浮层 ID 的 `aria-controls`。关闭时 expanded 为 false；如果浮层被卸载，controls 不应指向不存在的节点。
- 浮层根在 JSX 中声明 `role="dialog"`，并通过 `aria-labelledby` 关联可见标题；没有可见标题时必须提供 `aria-label` 或 `aria-labelledby`。它不设置 `aria-modal="true"`。
- 触发器上的 `aria-describedby` 用于 Tooltip 的简短说明，不能把可操作面板伪装成触发器描述。交互面板根可用 `aria-describedby` 关联简洁的说明文本；复杂内容不应整体读作一段冗长描述。
- 普通 `Popconfirm` 是非模态确认面板，根节点使用 `role="dialog"`，以可见标题命名，并按通用锚定 dialog 契约管理焦点；它不设置 `aria-modal`、不隔离背景且不循环 Tab。Stitch 稿中的 `role="alertdialog"` 是语义标注，不是可访问行为规范；首版保留其视觉设计，将语义调整为 `dialog`。
- `alertdialog` 只用于确实需要用户立即响应的紧急中断。该角色必须与真正的模态契约同时实现，包括 `aria-modal="true"`、焦点进入、Tab 限制、背景不可交互及关闭后的焦点恢复；不能通过 Popconfirm 的 role 属性覆盖启用。未来若需要紧急确认，应在独立模态组件规格中设计和验收，不扩大本 ADR 的非模态锚定原语。

### 焦点、关闭与嵌套

- 由鼠标或键盘打开后，焦点移到第一个合适的可操作项；没有可操作项时，焦点移至带 `tabIndex={-1}` 的浮层根。
- 对话框是非模态的：不锁滚动、不隔离背景、不显示遮罩、不循环 Tab。Tab/Shift+Tab 可离开浮层；焦点离开锚点、浮层和其嵌套浮层树后关闭当前面板，焦点留在用户移入的位置。
- 焦点从锚点转到 portal 内容或子浮层时不得因单个 blur 事件而关闭。关闭判定须结合当前活动元素与浮层树，避免 portal 的 DOM 分离造成误关。
- `Escape` 一次只请求关闭当前 Document 中最近打开的 lx-ui 浮层。嵌套 Tooltip 位于 Popover 内时，第一次 Escape 关闭 Tooltip，第二次才关闭 Popover。Tooltip 仍保持 `role="tooltip"`；Escape 后焦点留在原锚点，并在指针仍悬停或锚点仍聚焦时抑制立即重开。交互式 dialog 仅在焦点原本位于面板内、且锚点仍连接并可用时恢复焦点；若受控 `open` 未更新，只发出关闭请求，不伪造关闭状态。
- Escape 协调器按 `Document` 延迟注册：用 `WeakMap<Document, ...>` 区分多文档/iframe；没有打开浮层时不保留监听器；按激活顺序选顶层。它不能在模块初始化或 SSR render 时访问 `window`/`document`；注册与注销必须承受 StrictMode effect 重放且做到幂等。
- 锚定 dialog 的外部点击在 `pointerdown` 阶段关闭最上层面板，不阻止默认动作、不恢复焦点。当前锚点、当前浮层和嵌套浮层树都属于内部区域。Tooltip 沿用其公开触发与关闭状态，不因描述层上的点击拦截页面操作。
- 嵌套对话框通过 Floating UI 的公开 `FloatingTree` 关系处理树内 outside press 与焦点次序；共同 Escape 协议由 lx-ui 私有协调器负责，不能假定 AntD Tooltip 属于 Floating UI 树。

### SSR、定位与生命周期

- ID 用 React `useId` 生成；render 阶段不读取布局。定位 observer 只在锚点与浮层 DOM 均挂载且打开后注册，在关闭、ref 变化、锚点卸载和组件卸载时清理。
- Portal 目标优先使用宿主显式容器，其次使用拥有锚点的 `Document`；SSR 首次输出不依赖 DOM。服务器 HTML 与 hydration 的初始结构必须一致，并在文档中说明 portal 内容在客户端挂载前的可见性边界。首版目标必须位于锚点所属的同一 `Document`；Shadow DOM 容器暂不支持，除非样式注入与事件/焦点边界另行设计验收。
- React Portal 会保留 React Context，但不会继承 Provider DOM wrapper 上的 CSS 自定义属性。实现必须增加私有主题作用域 Context，携带最近 `LxConfigProvider` 的已解析 `--lx-*` 变量（含其 `style` 属性中的 `--lx-*` 覆盖）及 `data-lx-mode`、`data-lx-appearance`、`data-lx-density`、`data-lx-color` 标记。此 Context 仅供内部 portal 层使用，不扩展 `useLxTheme` 的公开返回类型。lx-ui 自有 portal 的最外层浮层根将这些值应用在自身，而不是写入共享 `body` 或宿主容器，避免不同 Provider 的主题相互污染。普通 CSS 属性不会从 Provider wrapper 复制到 portal 根。
- 最近的嵌套 Provider 优先；父级与子级主题、Provider 自定义变量、主题运行时切换和系统明暗变化都必须同步到对应已打开浮层。宿主显式指定的同文档容器只决定挂载位置，不改变触发器所属 React 子树解析出的主题。默认挂到 `Document` 可避开局部 `overflow` 裁切，但可能需要由宿主管理 z-index 层级；挂到局部容器可参与其层叠上下文，却可能被裁切，组件不能偷偷改挂载目标。
- `autoUpdate` 仅在浮层打开时运行，负责滚动、尺寸和布局变化；`flip`/`shift` 保证视口边缘和窄屏可见。容器裁切、滚动祖先和 RTL 要使用公开配置验证，不能通过查询 AntD 内部节点补偿。
- 异步内容更新不得重置 open 状态或无条件把焦点移回锚点。锚点在打开期间卸载时关闭面板，不尝试聚焦已失效元素。

## 依赖、体积与性能门槛

`@floating-ui/react@0.27.20` 在 registry 元数据中的解包体积为 934,317 字节，并依赖 `tabbable`、`@floating-ui/react-dom` 和 `@floating-ui/utils`。这代表安装依赖的体积，不等于实际页面 gzip 增量。库构建会保留 peer/production dependency 边界；消费端只应将实际使用的导出纳入 bundle。

实现批次必须在相同生产配置下记录依赖前后 ESM/CJS 和单个组件消费样例的 raw/gzip/brotli 差值，并验证 tree-shaking、普通入口未使用浮层时无新增执行。锚定组件的新增 gzip 应满足 `docs/performance.md` 的单组件 `≤8 KB` 预算；若超出，先优化导入和共享边界，再决定是否调整架构。不能以移除焦点管理、Escape、错误清理或定位更新换取体积。

优点是定位、观察器清理、portal 和焦点设施使用成熟实现，lx-ui 仍掌握公开语义和行为；代价是依赖安装体积、升级维护和消费端 bundle 成本。浮层闭合时禁止持续 resize/scroll observer；动效使用 `docs/animation.md` 的浮层时长与主题 token，并尊重系统 reduced motion。

## 未选方案

- **继续包装 AntD Popover/Popconfirm：** 公开接口无法满足项目的 dialog 角色、焦点和统一 Escape 契约；依赖默认 Tooltip 语义会把交互面板暴露为说明层。
- **自己实现测量、翻转、滚动监听和焦点管理：** 不增加第三方依赖，但会重复处理 RTL、滚动祖先、视口裁切、observer 生命周期、portal tab 顺序和嵌套浮层，维护和回归成本更高。
- **仅使用 HTML Popover API 或 `<dialog>`：** Popover API 不自动提供项目需要的定位和 dialog 焦点协议；`showModal()` 是模态行为，不能表示非模态锚定卡片。可在未来作为渐进增强重新评估，不作为本批跨浏览器基础。

## 2B-2 关闭条件

- 本 ADR 已由独立架构评审；实现须另有独立代码复审和返工复审。
- 受控/非受控、ARIA、无焦点内容、Tab/Shift+Tab、Escape、外部点击、focusout、嵌套 Tooltip/Dialog、Tooltip 防重开、焦点恢复、StrictMode、多实例和 SSR/hydration 测试通过。Popconfirm 的 `dialog` 名称/描述与非模态行为要有独立测试；没有引入紧急模态 `alertdialog` 前不得将静态稿角色写进实现。
- 自动化测试与真实浏览器都须覆盖正常动效和 `prefers-reduced-motion: reduce`：正常偏好保留设计规格的进入/退出时长与缓动；减少动效时浮层以静态状态出现和关闭，不播放位移、缩放或淡入淡出动画，且状态与焦点行为保持一致。
- 主题测试至少覆盖 light/dark、comfortable/compact、appearance、品牌色/东方配色、Provider 自定义 `--lx-*` 覆盖、父子嵌套 Provider、运行时切换、共享容器内多个不同主题浮层及自定义同文档 portal 容器；确认浮层获得锚点最近 Provider 的变量且不会改写共享容器或兄弟 Provider。
- 有可运行定位 demo，并在真实浏览器验证边缘翻转、滚动容器、窄屏、portal 主题作用域、RTL、缩放，以及系统动效偏好开启/关闭两种情况下的进出场；读屏验收缺口单独记录。
- 包体差值满足预算，构建产物声明不泄漏 Floating UI 类型，`Popover`/`Popconfirm` 仍未加入公开出口，直到后续 2B-3 自身完成。

## 重新评估条件

当 React 20/浮层依赖出现不兼容、定位或焦点协议需要绕过公开 API、实测 bundle 超出预算，或有明确的跨浏览器缺陷时重新评估。Ant Design 升级不自动构成回退到 AntD 私有实现的理由。
