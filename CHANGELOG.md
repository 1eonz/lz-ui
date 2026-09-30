# Changelog

## 当前设计一致性返工

- 补齐 General 五页和基础 Form 八页的中文使用/参数/事件/方法文档，新增39个独立场景（含DynamicForm五例）。修复Divider显式可访问名称转发及其余输入控件small尺寸被统一最小高度覆盖的问题。

- Input 新增六个独立可运行示例及中文参数、事件、实例方法文档；展示与反馈组件拆分专属场景。文档源码新增独立严格类型检查，避免示例使用不存在的 API。
- 共享演示容器显式加载基础样式；Input/按钮尺寸使用公开主题映射，保留宿主尺寸继承。项目自有代码注释统一中文，补充设计取舍及边界说明。

- 新增完全受控的 `CheckableTag`，ref 指向原生 button，支持原生键盘/禁用及 `aria-pressed`；Tag 默认关闭按钮可通过键盘操作，间距交由容器。
- Card 移除多余包装层，ref、className 和 style 统一归属 AntD 真实根节点；AvatarGroup 的 style 改为归属 lx-ui 容器，与 className/ref 一致。依赖旧包装 DOM 或内部 style 归属的宿主需调整。
- Pagination 修复隐藏/恢复及非受控页大小变化时的 ref 同步，避免 ref 指向已脱离文档的节点。
- Ant Design peer 下限从 `>=5` 收敛到 `>=5.24`，与当前公开 ref/API 契约及开发依赖基线一致。早期 5.x 宿主需升级，验证状态见 `docs/compatibility.md`。
- 子代理实施与独立复审统一使用 GPT-6.1-SOL medium / xhigh；组件实际演示、设计映射和浏览器验证分别记录，静态 GO 不代表完整视觉验收。

## Unreleased

- 新增 2A Feedback：Alert、Spin、Progress，透传 Ant Design 5 公开 API，明确 aria-busy、确定进度、关闭焦点和 reduced-motion 边界；不内置请求、重试、全局消息或伪进度。

- 新增 1B Tree：透传 AntD 5 公开树节点、受控展开/选择/勾选、异步加载、虚拟化和高度协议；保持稳定 key 与宿主请求边界，不生成节点 key、不包装布局、不依赖 rc-tree 私有类型。

- 新增 1B Table：透传 AntD 5 公开泛型表格协议，支持受控分页、筛选、排序、行选择、固定列、滚动和虚拟化；不生成 rowKey、不内置请求或跨页选择状态，`LxTableRef` 从 AntD 根入口组件推导，避免业务代码依赖 `antd/es/*` 或 `rc-table`。

- 新增 1B Pagination：透传 AntD 5 公开分页协议，支持受控/非受控页码、页大小、键盘和 disabled 语义；ref 与 className 保持在 AntD 根节点，不内置请求、URL 同步或页码修正。

- 新增 1B Table、Tree：Table 支持泛型列、分页/筛选/排序/选择、fixed/scroll/virtual 透传，Tree 支持稳定节点 key、受控展开/选择/勾选/加载和自定义节点泛型；请求、缓存、URL、权限、异步取消和错误恢复由宿主负责。

- 完成 1A Data Display：Result、Tag、Badge、Descriptions、Avatar、Statistic、Card、List。组件保留 AntD 5 公开 Props、className 和状态语义，补充稳定布局/ref 契约、键盘关闭、图片回退、统计格式化、加载/错误/空状态测试；List 保留泛型 `dataSource`/`renderItem` 推断和 `List.Item` 静态成员。

- 新增 Icon、Typography、Space、Divider 通用基础组件，使用按需图标源、原生语义和主题间距/颜色 token，并提供 Dumi 实时示例。

- 统一基础控件焦点轮廓：移除与 AntD 自带焦点叠加的包装层蓝框，主题通过公开 `controlOutline` token 提供贴边、清晰的输入类焦点色；修正文档站平板顶栏间距。
- 修正 Impeccable 审查流程与历史误判，记录双代理 UX/技术审计、浏览器证据和 P0 逐批路线。
- DynamicForm 增加可运行客户录入示例、原位加载/错误状态与异步选项失败重试；Dumi 平板顶栏与文档代码可读性单独修复。
- 改进 DynamicForm 文档示例：预览配置默认折叠，补充提交中、失败保留输入、重试和成功后的后续动作。
- 增加 `--lx-color-success-bg`、`--lx-color-warning-bg`、`--lx-color-error-bg` 和 `--lx-color-info-bg` 语义背景 token，供状态反馈使用。
- 新增公开 Checkbox 和 Switch 基础控件；DynamicForm 布尔字段改用公开控件，迁移时保持 AntD 5 原有 Props、事件和 ref 合约。
- 新增公开 Radio（含 Group）和 Upload 基础控件；Upload 默认仅本地维护 fileList，DynamicForm 字段改用公开控件并保留宿主注入请求能力。
- 新增公开 Empty 和 Skeleton 数据展示控件；Empty 支持 action/小尺寸变体，Skeleton 支持 loading 内容切换、busy 状态和稳定根 ref；新增 `lx-ui/antd` 显式 AntD 5 兼容出口。
- 创建 lx-ui Foundation 工程。
- 建立 React、TypeScript、Dumi、Father、Vitest、ESLint 和 Prettier 基础配置。
- 建立主题类型、CSS cascade layer、项目规则、性能、动画、测试和发布文档。
- 进入 P0 实现：新增主题运行时、六个基础组件目录和 DynamicForm schema 第一版。
- React peer 范围调整为 `>=18 <20`；新增与六个基础主题色并存的七套东方配色。
- 建立项目脑图、设计评审与可执行工程规则，并将组件目录统一为 kebab-case。
- UMD、其他 P0 组件和业务页面仍未交付，不能视作可发布的完整首版。
