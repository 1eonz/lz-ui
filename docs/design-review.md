# lx-ui 设计评审记录

> 评审阶段：UI 设计输入后的实现前评审
> 评审对象：`F:\work\lz-ui\UI` 下 Stitch 设计稿、`design.md` 与现有工程约束
> 结论：可以进入主题运行时和组件 API 细化；具体组件编码仍按组件逐项解除设计门禁。

> 历史说明：本文件保留设计输入阶段的提案，例如 `paletteSuite` 和阶段 A/C 排序；已确认的实施决策以 `design.md`、`docs/project-rules.md` 和 `docs/p0-execution-plan.md` 为准。

## 1. 已确认点

### 产品与技术边界

- 面向 ERP、CRM、商城运营、供应链和数据管理等 PC 中后台。
- React + TypeScript，首版 peer 范围为 React `>=18 <20`，重点验证 React 18/19。
- Ant Design 5 是 peer dependency 和能力底座；`lx-ui/antd` 作为显式迁移出口。
- 主包采用单包工程、Dumi 文档、Father 构建、CSS Variables + CSS Modules。
- `D:\lxy\crm\lxComponent` 仅用于目录和文档习惯参考，不修改、不复制实现。
- 设计未确认前不创建真实组件和页面 demo；脚手架门禁继续有效。

### 视觉与交互

- 三种外观：`business`、`soft`、`glass`。
- 六个稳定品牌主题色：`blue`、`orange`、`green`、`purple`、`cyan`、`rose`；另外新增七套东方配色，使用独立 `palettePreset`。
- 支持 `light`、`dark`、`system`，以及 `comfortable`、`compact` 两种密度。
- 组件状态必须覆盖 default、hover、active、focus-visible、disabled、loading、error、empty、selected、expanded、read-only。
- Glass 是渐进增强；不支持 `backdrop-filter` 时必须回退到可读的不透明表面。
- 字体、颜色、间距、圆角、阴影、控件高度和动效统一由 token 表达。
- WCAG 2.2 AA、键盘操作、焦点可见、`prefers-reduced-motion` 是首版要求。

### 设计稿中已有的可复用规范

- Inter 与中文系统字体的组合、14px/22px 正文和 11/12px 标签层级。
- 12 列桌面网格、16px gutter、24px 外边距的桌面布局基线。
- comfortable 控件约 40px、compact 控件约 32px；表格行有独立密度规格。
- 4px 基础圆角、6/8px 容器圆角、9999px 状态胶囊。
- Level 0/1/2/3 的边框和阴影层级，以及输入框 150ms 边框过渡、焦点外环。
- P0/P1 基础组件、P0 业务组合稿和侧边栏信息架构已提供可评审的视觉参考。

## 2. 冲突点与处理建议

### 6 个主题色与 7 套东方雅致配色

现有工程基线定义 6 个单一主色；新增设计稿又定义 7 组“矿物主色 + 环境辅色”双配色：青瓷绿、暮山蓝、石榴红、松针绿、雾霭紫、豆沙粉、酪黄。两者不是同一个抽象层级，直接合并会造成 `colorPreset` 数量、主题矩阵和设计 token 版本失控。

当前已确认保持以下两层模型：

1. `colorPreset` 保留 6 个稳定品牌主题色，兼容已有 API。
2. `palettePreset` 首版同时提供 7 组东方雅致配色，作为独立命名空间，不把 13 个值塞进一个枚举。
3. 每组配色必须补齐 dark、compact、语义色映射、对比度报告和主题矩阵；不能只提供一张浅色静态稿。

建议命名为 `paletteSuite: 'standard' | 'oriental'`，而不是把 13 个颜色直接塞入一个枚举。这样既保留设计方向，也避免后续删除实验色时破坏主 API。

### 设计稿颜色与现有 Ant Design token

设计稿包含 Material 语义命名（如 `surface-container`、`on-surface`）和 Ant Design 风格 token（如 `colorPrimary`）两套表达。代码中需要建立单向映射：原始/语义 token 是 lx-ui 的来源，再映射到 AntD `ConfigProvider`；组件不能同时读取两套来源。

### 设计稿字体和外部资源

`code.html` 使用 Tailwind CDN、Google Fonts 和 Material Symbols。它们适合视觉验证，不应进入库产物。实现阶段使用 CSS 字体栈、项目内图标入口和 token；如需要外部字体，应由宿主应用决定加载策略。

### Glass 效果与数据密集场景

玻璃效果适合工作台和品牌展示，但透明表面、模糊和复杂阴影会降低表格、表单、弹层的可读性并增加绘制成本。建议默认 `business`，glass 仅对页面级容器和非关键装饰启用；关键控件保持实色背景和清晰边界，并提供 reduced motion/低性能回退。

## 3. 首批实现范围建议

### 阶段 A：主题运行时和基础能力

- `LxConfigProvider`、主题读取/切换 hook、持久化和 SSR 安全。
- Token、CSS Variables、AntD 5 token 映射、light/dark/compact 矩阵。
- General、Layout、Form 中最小可用集合：Button、Input、Select、Form、Card、Space、Typography、PageContainer。

### 阶段 B：数据与反馈

- Table、Pagination、Tag、Badge、Descriptions、Empty、Skeleton。
- Modal、Drawer、Message、Notification、Tooltip、Spin、Alert。
- 先保证 loading、empty、error、focus 和键盘路径，再扩展装饰性样式。

### 阶段 C：业务组合

- `ProTable`：筛选、列配置、分页、批量操作、加载/空/错误状态；请求由 `request` 或受控 `dataSource` 注入。
- `SearchForm`：字段配置、折叠、查询/重置、URL 参数适配；不直接依赖路由库。
- `DynamicForm`：字段描述数组驱动渲染，支持基础字段、规则、联动和自定义渲染。
- `QuickField`：展示、编辑、校验和提交状态之间的单字段切换。
- `PageContainer`：标题、面包屑、操作区、内容区和底部操作布局。

## 4. 动态表单重点评审

动态表单是后台系统的高频能力，建议公共 API 先围绕“字段描述 + 注册表 + 表单实例”设计：

```ts
type DynamicField = {
  name: string | string[];
  type:
    | 'text'
    | 'textarea'
    | 'number'
    | 'select'
    | 'date'
    | 'dateRange'
    | 'checkbox'
    | 'radio'
    | 'switch'
    | 'upload'
    | 'custom';
  label?: React.ReactNode;
  rules?: Rule[];
  dependencies?: string[];
  visible?: boolean | ((values: unknown) => boolean);
  disabled?: boolean | ((values: unknown) => boolean);
  componentProps?: Record<string, unknown>;
  render?: (field: DynamicField, context: DynamicFieldContext) => React.ReactNode;
};
```

这只是讨论用类型，正式 API 需要解决：字段名路径和数组项、异步 options 的取消与缓存、依赖字段重新校验、默认值与回填错误、分组/步骤布局、文件上传值规范、权限导致的隐藏字段和服务端校验错误。规则不能只依赖 `visible: false` 删除值，必须明确隐藏字段是否保留提交值。

## 5. 未决事项

| 事项                       | 推荐决策                                                   | 进入编码前的验收证据                      |
| -------------------------- | ---------------------------------------------------------- | ----------------------------------------- |
| 东方雅致 7 套配色是否首发  | 首版以独立 `palettePreset` 提供，与 `colorPreset` 并存     | 7 套 light/dark/compact 对比度与 token 表 |
| `DynamicForm` 是否内置请求 | 只提供字段和 options 注入协议，不内置请求库                | 异步 options、取消、错误回填示例          |
| 字段联动表达式             | 优先函数回调，必要时提供受限声明式规则                     | 循环依赖、卸载字段和重新校验测试          |
| URL 参数适配               | `SearchForm` 提供序列化适配器，不直接绑定路由              | 空值、数组、日期和恢复筛选示例            |
| `ProTable` 数据协议        | 同时支持受控 `dataSource` 与显式 `request`，二者行为写清楚 | 分页、排序、筛选、取消请求测试            |
| 图标来源                   | 使用按需入口，避免整套图标进入主包                         | 构建体积报告与 tree-shaking 检查          |
| 国际化与时区               | 首版提供 locale/format 注入点，中文默认文案可替换          | 中英文日期、错误和空状态示例              |
| 主题持久化                 | 默认 `lx-ui-theme`，允许 key 和 storage 注入               | SSR、隐私模式、存储失败回退测试           |
| Glass 性能边界             | 页面容器可用，数据关键面默认不透明                         | 低端设备和 reduced motion 验证            |
| React 16/17 下的行为       | 首版不承诺，peer 范围固定为 `>=18 <20`                     | React 18/19 安装和基础组件 smoke test     |

## 6. 评审结论与下一步

当前设计足以开始主题运行时、token 映射和组件 API 的细化。组件实现前仍需逐个确认 Stitch 状态稿，尤其是 DynamicForm、ProTable 的真实页面组合和东方雅致配色的产品定位。完成上述未决项后，更新 `design.md` 当前阶段、组件门禁清单和对应 ADR，再解除具体组件目录的实现限制。

## 7. 旧版 lxComponent 的可吸收经验

对 `D:\lxy\crm\lxComponent` 做只读盘点后，确认它有几项值得保留的工程经验：组件目录自带 `index.tsx`、文档和样式，`quick-field` 将展示态与编辑态拆开，表格目录把尺寸监听、选择、空状态和虚拟行拆成独立职责，树形部门选择也把数据处理和视图拆开。这些做法有助于后续扩展和定位问题。

旧项目的 `antd@4`、React 16、Less 全局样式、Moment、整包 AntD 转出、重复的 `lxtable`/`lxtable-new` 和业务请求耦合不直接移植。lx-ui 会保留职责拆分和场景命名，改用 Ant Design 5 公共 API、CSS Variables、CSS Modules、按需入口、可选虚拟化和宿主注入的请求协议。这样能吸收成熟经验，同时避免把旧项目的版本和包体负担带进新库。

首批实现顺序因此调整为：`LxConfigProvider` 与 token runtime -> Button/Input/Select/InputNumber/DatePicker 等基础控件 -> FormItem -> DynamicForm -> SearchForm/QuickField -> ProTable。DynamicForm 不再自带一套独立视觉控件，而是通过基础控件出口组合。
