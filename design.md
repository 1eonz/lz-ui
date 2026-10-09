# lx-ui 组件库设计方案

> 版本：v0.1 初稿  
> 文档用途：项目架构基线、Stitch UI 设计输入、后续开发验收依据  
> 目标目录：`F:\work\lz-ui`  
> 参考范围：借鉴 `D:\lxy\crm\lxComponent` 的组件分目录和文档习惯，不修改、不复制其实现

> 当前实施阶段：**P0 implementation**。Stitch 已交付基础视觉、主题矩阵、P0 组件和业务组合稿；先验收主题运行时及基础控件，再让 DynamicForm 组合这些控件，最后扩展其他组件。

## 1. 项目定位

`lx-ui` 是面向 React PC 中后台的内部 UI 组件库，服务于 ERP、CRM、商城运营后台、客服后台、供应链和数据管理系统。

首版重点解决三类问题：

1. 统一不同项目的基础交互、视觉语言和主题能力。
2. 提供表格、表单、筛选、弹框、反馈等中后台高频能力，减少重复开发。
3. 在保留 Ant Design 5 能力的同时，逐步沉淀适合自身业务的增强组件。

首版不把 Vue、移动端原生组件、React Native、图表库、富文本编辑器和复杂低代码引擎纳入范围。

## 2. 目标用户和使用场景

### 2.1 主要使用者

- 使用 React + TypeScript 的前端开发者。
- 负责 ERP、CRM、商城后台和运营平台的业务团队。
- 需要快速搭建管理页面、数据录入页面和数据分析页面的产品与设计人员。

### 2.2 首要页面类型

- 列表页：筛选区、表格、批量操作、分页、导出和空状态。
- 表单页：创建、编辑、详情、分步填写、校验和提交反馈。
- 工作台：统计卡片、快捷入口、待办列表和趋势摘要。
- 详情页：信息分组、标签、时间线、关联数据和操作记录。
- 组织/权限页：树、部门人员选择、角色配置和批量操作。
- 运营页：订单、商品、库存、客户、售后和营销活动管理。

## 3. 设计原则

### 3.1 一套基础语言，多种可控外观

结构、交互和可访问性保持统一；商务稳重、轻盈现代和玻璃液态只改变视觉表达，不改变同一组件的核心使用方式。

### 3.2 业务优先，渐进增强

首版优先保证 ERP/CRM 常见的表单和表格流程。玻璃液态等需要浏览器能力的效果必须有清晰回退，不能影响内容可读性和操作完成率。

### 3.3 组合优于大量开关

复杂组件优先通过 `children`、插槽、render props 和列配置组合，避免一个组件堆积大量互相影响的布尔属性。

### 3.4 设计 token 是设计和代码的共同语言

颜色、字体、间距、圆角、阴影、控件高度、动效时长和层级全部通过 token 管理。组件样式不直接复制主题色值。

Button 使用固定档位协议：省略 `size` 时由 lx 按 density 使用 comfortable 40px、compact 32px；显式 `size="middle"` 固定 32px，显式 `small` 固定 24px，显式 `large` 固定 40px。包装层显式解析省略尺寸，因此宿主 `ConfigProvider.componentSize` 不覆盖 lx Button 的省略解析；设计稿尺寸表中的 Middle 32px 在两种 density 下都保持不变。Button 专属 `controlHeightLG` 覆盖为 40px，但全局 `token.controlHeightLG` 保留 48px 供其他组件使用，取舍见 [ADR-0006](./docs/adr/0006-button-size-density.md)。普通 Tag 使用默认 26px 最小高度，可通过可选组件 token `--lx-tag-height` 在主题 scope 内扩展或覆盖；内容更高时由内容自然撑开。默认/large Table 行高随 density 为 48/36px；单行表头目标高度为 36px，长表头或长内容允许换行并自然增高，不能为满足固定高度裁切内容；显式 middle/small 与 virtual 表格保留 AntD/宿主尺寸责任。Tag 默认关闭按钮以 24px 为桌面最小目标尺寸；粗指针设备通过公开 token `--lx-control-target-touch-min` 扩大至默认 44px。退出动效使用公开 token `--lx-motion-tag-exit-duration`，默认 120ms，并在 reduced-motion 下归零。

### 3.5 可访问性是首版要求

以 WCAG 2.2 AA 为基线：键盘可用、焦点可见、表单有真实标签、错误信息可感知、颜色不是唯一信号、普通文本对比度至少 4.5:1，交互区域优先达到 44×44 CSS px。

## 4. 技术基线

| 项目         | 首版决策                                                                    |
| ------------ | --------------------------------------------------------------------------- |
| UI 框架      | React，代码使用 TypeScript                                                  |
| 重点验证版本 | React 18、React 19                                                          |
| 兼容范围     | React 18、React 19；首版不承诺 React 16/17                                  |
| 基础组件来源 | Ant Design 5 作为 peer dependency 和能力底座                                |
| 样式         | CSS Variables + CSS Modules；全局只保留 token、reset 和必要的层级样式       |
| 文档         | Dumi；组件文档与组件目录相邻，项目指南放在 `docs/`                          |
| 包构建       | Father/Rollup 类库构建，输出 ESM、CJS、类型声明、CSS 和 UMD                 |
| 测试         | Vitest + Testing Library；交互组件补充 axe 可访问性检查                     |
| 代码质量     | ESLint、Prettier、TypeScript strict；版本记录和发布流程见 `docs/release.md` |
| 发布         | npm 私库；遵循 SemVer，支持固定版本和变更日志                               |
| 浏览器       | Chrome、Edge、Safari 最近两个大版本；不承诺 IE                              |
| SSR          | 主题持久化和浏览器 API 必须 SSR 安全，首次渲染不能依赖 `window`             |

### 4.1 Ant Design 5 兼容策略

主包只围绕 Ant Design 5 设计，不在同一个 `lx-ui` 版本中同时打包 Ant Design 4。Ant Design 4 的兼容会造成主题变量、组件 API、日期依赖和全局样式处理分叉，也会增加产物体积和升级成本。

`antd`、`react`、`react-dom` 均放入 `peerDependencies`，由业务项目安装。建议的 peer 范围为：

```json
{
  "react": ">=18 <20",
  "react-dom": ">=18 <20",
  "antd": ">=5.24 <6"
}
```

主入口不直接把所有原生 Ant Design 组件和 `lx-ui` 增强组件混在一个命名空间里，避免同名覆盖和迁移时无法判断组件来源：

```tsx
import { Button, LxConfigProvider, ProTable } from 'lx-ui';
import { DatePicker, Form } from 'lx-ui/antd';
```

其中：

- `lx-ui`：导出主题 Provider、基础增强组件和 business 组件。
- `lx-ui/antd`：原样转出 Ant Design 5 组件，作为迁移和补充出口。
- 未来若确有存量项目需要 antd 4，单独维护 `lx-ui-antd4-compat`，不进入首版主包。

## 5. 视觉系统

### 5.1 三种风格预设

风格使用稳定的英文 key，中文名称用于设计稿和文档展示。风格只改变外观 token，不改变组件 API。

| key        | 名称     | 视觉方向                                       | 适用场景                             |
| ---------- | -------- | ---------------------------------------------- | ------------------------------------ |
| `business` | 商务稳重 | 清晰边界、克制阴影、中等圆角、信息密度高       | ERP、CRM、财务和供应链后台，默认风格 |
| `soft`     | 轻盈现代 | 更柔和的表面层次、较轻边框、舒适留白和轻量阴影 | 客户运营、商城运营、工作台           |
| `glass`    | 玻璃液态 | 半透明表面、背景模糊、渐变光晕和更明显的层级   | 品牌展示、活动运营、数据工作台       |

玻璃液态只作为渐进增强：支持 `backdrop-filter` 时启用模糊，不支持时回退到不透明表面；文本、表单边界、焦点环和错误提示仍按对比度标准渲染。禁止用玻璃效果削弱表格、表单和弹框的可读性。

### 5.2 六个主题色

主题色只表达品牌和交互强调，不替代成功、警告、错误、信息四类语义色。每个主题由一个 seed 色生成完整色阶和浅色/深色 token，不要求组件直接使用 seed 色。

| key      | 名称     | 建议 seed |
| -------- | -------- | --------- |
| `blue`   | 海洋蓝   | `#1677FF` |
| `orange` | 活力橙   | `#F97316` |
| `green`  | 翡翠绿   | `#16A34A` |
| `purple` | 智慧紫   | `#7C3AED` |
| `cyan`   | 清透青   | `#0891B2` |
| `rose`   | 品牌玫红 | `#E11D48` |

主题 token 至少包含：

- `colorPrimary`、`colorPrimaryHover`、`colorPrimaryActive`、`colorPrimaryBg`、`colorPrimaryBorder`。
- `colorText`、`colorTextSecondary`、`colorTextTertiary`、`colorTextDisabled`。
- `colorBgBase`、`colorBgContainer`、`colorBgElevated`、`colorFillSecondary`。
- `colorBorder`、`colorBorderSecondary`、`colorSplit`。
- `colorSuccess`、`colorWarning`、`colorError`、`colorInfo` 及其背景和边框。

### 5.2.1 七套东方色系

UI 设计交付新增了七套东方配色。它们使用独立的 `palettePreset` 命名空间，与六个品牌 `colorPreset` 并存，避免破坏已有主题 API：

```ts
type LxPalettePreset =
  | 'celadon-laurel'
  | 'twilight-peach'
  | 'garnet-almond'
  | 'pine-amber'
  | 'misty-oatmeal'
  | 'bean-sand-ink'
  | 'cheese-distant-cyan';
```

当两者同时提供时，`palettePreset` 决定 lx-ui 的视觉色阶，`colorPreset` 作为 Ant Design 兼容层的 seed；组件不得直接判断具体色值。

### 5.3 明暗模式和密度

```ts
type LxThemeMode = 'light' | 'dark' | 'system';
type LxAppearance = 'business' | 'soft' | 'glass';
type LxDensity = 'comfortable' | 'compact';
type LxColorPreset = 'blue' | 'orange' | 'green' | 'purple' | 'cyan' | 'rose';
```

- `light` 和 `dark` 使用独立的表面、文本、边框和阴影 token，不做简单颜色反转。
- `system` 跟随 `prefers-color-scheme`，用户显式选择后覆盖系统偏好。
- `comfortable` 适用于普通后台页面，`compact` 适用于大数据表格和密集操作页面。
- 运行时切换由 `LxConfigProvider` 提供，持久化使用可配置的 `localStorage` key，默认 `lx-ui-theme`。
- SSR 时先使用服务端传入的初始配置；客户端恢复持久化配置时要避免明显闪烁。

### 5.4 Token 分层

```text
原始色值 / 字体 / 间距
        ↓
语义 token：文字、表面、边框、交互、状态
        ↓
组件 token：按钮、输入框、表格、弹框、标签……
        ↓
CSS Variables + Ant Design ConfigProvider token
```

CSS 变量统一使用 `--lx-` 前缀，组件局部变量使用 `--lx-button-*`、`--lx-table-*` 等命名，避免污染业务项目。

## 6. 目录结构

首版采用单包工程，目录直观，保留参考项目“组件自带代码、样式、文档”的优点；暂不引入多包 monorepo。未来 business 组件稳定后，可再拆成独立包。

```text
lx-ui/
├─ src/
│  ├─ components/
│  │  ├─ general/                 # Button、Icon、Typography、Space、Divider
│  │  ├─ form/                    # Form、Input、Select、DatePicker、Upload
│  │  ├─ data-display/            # Table、Tree、Tag、List、Descriptions
│  │  ├─ data-entry/              # 复杂录入和可编辑交互
│  │  ├─ feedback/                # Modal、Drawer、Message、Notification、Spin
│  │  ├─ navigation/              # Tabs、Menu、Breadcrumb、Pagination、Steps
│  │  ├─ layout/                  # Layout、Card、Flex、Grid
│  │  └─ business/                # ProTable、SearchForm、QuickField、PageContainer
│  ├─ theme/
│  │  ├─ ThemeProvider.tsx        # LxConfigProvider 和主题上下文
│  │  ├─ tokens.ts                # 原始 token 和语义 token
│  │  ├─ presets.ts               # 3 种风格、6 个主题色、明暗模式
│  │  ├─ algorithms.ts            # token 计算和 AntD token 映射
│  │  ├─ styles.css               # CSS Variables 和全局主题层
│  │  └─ index.ts
│  ├─ icons/                      # 内置图标和图标类型
│  ├─ utils/                      # DOM、尺寸、键盘、数据和类型工具
│  ├─ styles/
│  │  ├─ reset.css
│  │  ├─ global.css
│  │  └─ layers.css               # @layer 顺序和全局规则
│  ├─ antd.ts                     # 原生 Ant Design 5 统一出口
│  ├─ components.ts               # 基础增强组件统一出口
│  ├─ business.ts                 # business 组件统一出口
│  ├─ index.ts                    # lx-ui 主入口
│  └─ index.md                    # 组件总览和使用说明
├─ docs/
│  ├─ guide/                      # 安装、升级、工程接入
│  ├─ theme/                      # 风格、主题、密度、暗色模式
│  ├─ migration/                  # 从 antd 直接使用到 lx-ui 的迁移
│  └─ release/                    # 版本变更和发布说明
├─ examples/                      # 可运行的 ERP、CRM、商城后台示例
├─ tests/                         # 跨组件集成测试和可访问性测试
├─ scripts/                       # 构建、检查、发布和生成脚本
├─ public/                        # Dumi 静态资源
├─ .dumirc.ts
├─ .fatherrc.ts
├─ package.json
├─ tsconfig.json
├─ vitest.config.ts
├─ design.md
└─ README.md
```

每个组件目录使用统一模板：

```text
Button/
├─ index.tsx                    # 组件实现和公开导出
├─ index.module.css             # 组件局部样式
├─ index.md                     # Dumi 文档、示例和 API
├─ types.ts                     # 对外类型；复杂组件再拆分
├─ utils.ts                     # 仅服务本组件的计算逻辑
└─ __tests__/
   └─ index.test.tsx
```

文件命名遵循组件目录统一使用 `index.*`，便于复制组件模板；目录名使用 kebab-case，组件导出使用 PascalCase。

## 7. 首版组件地图

完整组件地图会在文档站展示；实现按 P0/P1 分阶段，避免为了“组件数量”牺牲 API、可访问性和主题质量。

### 7.1 P0 基础组件

| 分类                     | 组件                                                                                                            |
| ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| P0 基础组件-General      | Button、Icon、Typography、Space、Divider、ConfigProvider                                                        |
| P0 基础组件-Form         | Form、Input、InputNumber、Select、Cascader、TreeSelect、Checkbox、Radio、Switch、DatePicker、TimePicker、Upload |
| P0 基础组件-Data Display | Table、Pagination、Tree、Card、Tag、Badge、Avatar、List、Descriptions、Statistic、Empty、Skeleton、Result       |
| P0 基础组件-Feedback     | Alert、Message、Notification、Modal、Drawer、Popconfirm、Tooltip、Popover、Spin、Progress                       |
| P0 基础组件-Navigation   | Tabs、Dropdown、Breadcrumb、Menu、Steps                                                                         |
| P0 基础组件-Layout       | Layout、Flex、Grid、PageContainer                                                                               |

### 7.2 P0 业务组件

| 组件            | 解决的问题                                                     |
| --------------- | -------------------------------------------------------------- |
| `ProTable`      | 筛选、表格、分页、列配置、加载/空/错误状态和批量操作的统一组合 |
| `SearchForm`    | 将筛选字段、折叠、重置、查询和 URL 参数适配成一致模式          |
| `QuickField`    | 同一字段在展示、编辑、校验和提交状态之间切换                   |
| `PageContainer` | 页面标题、面包屑、操作区、内容区和底部操作的统一布局           |

业务组件依赖基础组件和公开 token，不读取 Ant Design 私有 DOM 类名，不把业务请求、权限和路由耦合到组件内部。

### 7.3 P1 组件

VirtualTable、EditableTable、DataToolbar、FilterPanel、DepartmentPicker、UserPicker、CascaderPanel、拖拽排序、批量导入、文件预览、统计看板卡片等列入 P1。P1 组件先通过 examples 验证真实业务 API，再决定是否进入主包稳定出口。

### 7.4 Tooltip 与交互式锚定弹层

- `Tooltip` 仅用于简短、非交互说明，默认支持 hover 和 focus；不接管子元素的键盘行为、不为静态元素自动制造焦点停靠点。打开时应通过描述 IDREF 暴露提示，关闭后保留宿主已有说明。
- Tooltip 的默认深色 surface 与文字来自 `UI/P0 基础组件-Feedback/code.html` 的 `#1f2937` / `#ffffff`；主题主色不改变该反差，亮色例外由调用者通过公开 `color`、`styles` 组合覆盖。
- `Popover` 和 `Popconfirm` 可承载链接、按钮等交互内容，不能复用 Tooltip 的非交互描述语义。它们依赖的 dialog 语义、焦点进入/恢复、Escape/外部关闭、锚点状态、SSR 与依赖边界已记录在 [ADR-0004](docs/adr/0004-anchored-dialog.md)。原语实现等待现有组件的 2B-1 浏览器验收门槛关闭；Popover/Popconfirm 在 2B-3 自身验收完成前不进入公开出口。禁止依赖 AntD 私有 DOM 或运行时改写原生角色。

## 8. 组件 API 约定

### 8.1 命名与导出

- 基础增强组件尽量沿用 Ant Design 5 的命名和参数语义，降低迁移成本。
- 新增能力使用明确的业务名称，例如 `ProTable`、`SearchForm`、`QuickField`。
- 组件默认使用命名导出；仅在组件内部允许默认导出。
- 需要 DOM 操作的组件使用 `forwardRef`，公开 ref 类型，不公开内部 DOM 结构。
- 所有组件接受 `className`、`style` 和 `data-*` 属性透传能力，但不允许业务覆盖关键可访问性属性。

### 8.2 状态与受控模式

- 支持受控和非受控的组件必须明确文档写法，不根据某个 prop 是否存在隐式切换多种行为。
- 组件内部状态只放在最低公共拥有者，派生数据在渲染时计算，不重复存储。
- 异步内容必须有 loading、empty、error 三类状态；表格和列表不能只显示一个旋转图标。
- 破坏性操作需要与风险匹配的确认、撤销或恢复路径。

### 8.3 DynamicForm 提交协议与迁移

- DynamicForm 负责字段校验和提交值整理，`onFinish` 在 AntD 校验成功回调中同步调用，保留宿主建立 ref 提交锁的时机；不额外排入微任务，也不把 `ref.submit(): void` 改成等待业务请求的 Promise。
- `onFinish` 的同步抛错与 Promise 拒绝通过 `onFinishError(error, values)` 通知。两个回调使用同一份提交输出，`omitHidden` 的过滤结果一致，失败不清除字段。字段校验失败由 `onFinishFailed` 处理，不进入提交错误通道。
- 未提供 `onFinishError` 时记录中文 `console.error`；错误回调自身同步抛错或异步拒绝也以日志兜底，防止未处理拒绝。组件卸载后仍捕获提交拒绝并通知宿主，宿主拥有 loading、同步提交锁、取消、过期请求与卸载状态保护。
- 迁移时保留同步提交代码与校验失败处理；依赖全局未处理拒绝的错误展示改用 `onFinishError`。已有 `onFinish` 内部自行消化失败时不会重复通知。可运行示例 `dynamic-doc-submit.tsx` 演示首次失败、值保留、重试成功与请求生命周期。

#### DynamicForm 依赖与级联值

- `dependencies` 沿用 AntD 的重新校验语义，并驱动异步 Select 按原查询刷新候选；声明依赖本身不清除任何表单值。
- `clearOnDependencyChange` 仅属于异步 Select，默认关闭。开启后只响应用户交互导致的真实依赖值变化，并在消费者 `onChange` 前同步清除旧子值；同一交互交付的新子值优先保留。
- 程序化 `setFieldsValue`、受控 `value` 更新和重置不运行级联清理；宿主原子更新程序化父子值，重置恢复初始值。嵌套清理路径明确写入 `changed` 和 `all`，包括隐藏保留字段；`omitHidden` 仍决定提交输出。
- 依赖刷新会取消旧请求并推进 requestId；不支持取消的旧加载器也不能覆盖新候选。异步字段隐藏时取消请求和防抖计时器、保留查询，重新显示后按原查询刷新；schema 移除时清除查询和选项状态；同 key 替换 `loadOptions` 时以新函数重载原查询。Select 选择值先调用 Form 注入的 `onChange`，再调用 `inputProps.onChange`，最后清理内部查询。可运行的三级级联示例展示默认异步刷新和显式清值策略。

### 8.4 样式覆盖

- 公开优先级从低到高为：主题 token、组件 token、组件 `className`、明确的 CSS 变量覆盖。
- 不鼓励业务项目依赖 `.ant-*` 或 `.lx-*` 内部结构选择器。
- 业务定制优先通过 `className`、CSS 变量和 slot 完成，避免 `!important`。

### 8.5 AntD primitive adapter 边界

- `Radio`、`Upload`、`Empty` 和 `Skeleton` 首版先作为 lx-ui 的公开增强包装层交付：保留 Ant Design 5 的 Props、事件和公开 ref 语义，在外层补充 lx token、焦点、状态和文档示例。
- `Upload` 没有 `action` 或 `customRequest` 时只维护本地 `fileList`；宿主明确注入 transport 后才进入上传生命周期。文件权限、进度、重试和服务端 ID 映射属于宿主或后续业务组合，不在 primitive 内创建请求。
- `Empty` 的恢复/创建动作由宿主通过 `action` 注入；`Skeleton` 只负责占位和 loading/children 切换，错误和重试必须由宿主组合 `Empty` 或反馈组件完成。
- 原生 Ant Design 5 能力通过 `lx-ui/antd` 显式清单转出，避免通配符导出、私有 DOM 依赖和名称漂移。设计稿中更复杂的拖拽上传、完整进度卡片和业务错误流，只有在独立 API/状态评审后才升级为组合组件。

## 9. 主题运行时设计

### 9.1 Provider 示例

```tsx
import { Button, LxConfigProvider } from 'lx-ui';

export default function App() {
  return (
    <LxConfigProvider
      theme={{
        colorPreset: 'blue',
        mode: 'system',
        appearance: 'business',
        density: 'comfortable',
        persist: true,
      }}
    >
      <Button type="primary">保存</Button>
    </LxConfigProvider>
  );
}
```

### 9.2 运行时行为

- Provider 在根节点设置 `data-lx-mode`、`data-lx-appearance`、`data-lx-density` 和 `data-lx-color`。
- 主题切换只更新 token 和 Ant Design `ConfigProvider`，不重载页面。
- `useLxTheme()` 提供读取和更新主题的能力。
- `setLxTheme()` 只作为必要的命令式补充，不使用旧式的全局 `window.changeTheme` 作为主 API。
- 持久化逻辑必须检查 `window` 和 `localStorage` 是否存在，支持 SSR、隐私模式和存储失败回退。

## 10. 按需引入和产物

### 10.1 npm 使用

```tsx
import { Button, LxConfigProvider } from 'lx-ui';
import { ProTable } from 'lx-ui/business';
import { DatePicker } from 'lx-ui/antd';
import 'lx-ui/style.css';
```

入口使用 ESM 保留模块边界，构建工具可以进行 tree-shaking；CSS 作为显式副作用标记，避免被错误删除。

### 10.2 直接 JS 使用

提供独立的浏览器 UMD 产物，不影响 npm 默认包体：

```html
<link rel="stylesheet" href="/assets/lx-ui/lx-ui.css" />
<script src="/assets/lx-ui/lx-ui.standalone.umd.js"></script>
<script>
  // 浏览器全局对象名固定为 LxUI
  const { Button } = window.LxUI;
</script>
```

UMD 分为：

- `lx-ui.umd.js`：React、ReactDOM 和 antd 外置，适合已有 React 运行时的页面。
- `lx-ui.standalone.umd.js`：包含运行所需依赖，适合脚本直引；单独统计体积并设置体积预算。

### 10.3 `package.json` 出口

```json
{
  "main": "dist/cjs/index.cjs",
  "module": "dist/esm/index.js",
  "types": "dist/esm/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/esm/index.d.ts",
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.cjs"
    },
    "./antd": {
      "types": "./dist/esm/antd.d.ts",
      "import": "./dist/esm/antd.js",
      "require": "./dist/cjs/antd.cjs"
    },
    "./business": {
      "types": "./dist/esm/business.d.ts",
      "import": "./dist/esm/business.js",
      "require": "./dist/cjs/business.cjs"
    },
    "./style.css": "./dist/esm/style.css"
  },
  "sideEffects": ["**/*.css"]
}
```

## 11. 文档和 Stitch 设计交接

### 11.1 Stitch 需要输出的设计内容

请按下面的顺序建立设计稿，避免只画静态按钮而没有系统状态：

1. **基础视觉页**：字体、颜色、色阶、间距、圆角、阴影、边框、图标、动效和焦点环。
2. **主题矩阵页**：6 个主题色 × light/dark × comfortable/compact 的关键组件对照。
3. **风格页**：商务稳重、轻盈现代、玻璃液态三个预设的页面级示例。
4. **组件总览页**：按 General、Form、Data Display、Feedback、Navigation、Layout、Business 分类。
5. **组件状态页**：default、hover、active、focus、disabled、loading、error、empty、selected、expanded、read-only。
6. **业务组合页**：ProTable、SearchForm、QuickField、PageContainer 的典型 ERP/CRM 页面。
7. **响应式和可访问性页**：键盘焦点、错误提示、窄屏表格、200% 放大、暗色和 reduced motion。

### 11.2 每个组件设计交付物

- 组件用途和不适用场景。
- 基础、悬停、按下、焦点、禁用、加载、错误和空状态。
- 尺寸、密度、圆角、颜色和 token 映射。
- 浅色、深色、三种风格和至少两个主题色的对照。
- 键盘行为、屏幕阅读器名称、错误提示和焦点移动。
- 设计稿与代码组件的命名对应关系。

### 11.3 Dumi 组件文档模板

每个 `index.md` 至少包含：

1. 组件定位和使用场景。
2. 基础示例。
3. 受控和非受控示例。
4. 尺寸、风格、主题和密度示例。
5. 加载、空、错误、禁用和无障碍示例。
6. Props、事件、ref 和类型说明。
7. 迁移提示和常见错误。

## 12. 测试和质量门槛

### 12.1 单元和交互测试

- 组件的公开行为用 Testing Library 测试，不测试内部实现细节。
- Form、Modal、Select、DatePicker、Table、ProTable、QuickField 优先覆盖键盘和异步状态。
- 每个可加载、可为空、可失败的数据组件都要有对应测试。

### 12.2 可访问性检查

- 键盘完成主要流程，Tab 顺序与视觉顺序一致。
- 焦点环在三种风格、六个基础主题色、七套东方配色和 dark mode 下都可见。
- 表单 label、错误信息、必填提示和 aria 属性可被辅助技术读取。
- 颜色不是唯一状态信号，状态同时使用文本、图标或结构变化。
- 动效尊重 `prefers-reduced-motion`，不产生超过 3 次/秒的闪烁。

### 12.3 构建和体积

- 每次提交执行 typecheck、lint、unit test 和 library build。
- 发布前构建 ESM、CJS、类型声明、CSS 和 UMD，并检查 exports 是否完整。
- 记录主入口和 standalone UMD 的体积；新增依赖需要说明必要性和包体影响。
- 生产构建不依赖 Dumi demo，不把 examples 打进 npm 主产物。

## 13. 开发阶段

### Phase 0：基础工程

- 初始化单包工程、TypeScript、Dumi、Father、Vitest 和版本记录流程；Changesets 在首次发布前单独评审接入。
- 建立 token、三种风格、六个基础主题色、七套东方配色、明暗模式和两种密度。
- 完成 `LxConfigProvider`、样式入口、Ant Design 5 出口和包 exports。

### Phase 1：P0 基础组件

- 按 General、Form、Data Display、Feedback、Navigation、Layout 分批实现。
- 每批组件同时完成文档、主题矩阵、键盘行为和 loading/empty/error 状态。

### Phase 2：P0 业务组件

- 以真实 ERP/CRM 页面验证 ProTable、SearchForm、QuickField、PageContainer。
- 先确定数据请求、权限、URL 参数和表格列配置的边界，再稳定公开 API。

### Phase 3：发布和迁移

- 提供 npm 私库安装、子路径按需引入、React 页面使用和 UMD 直引示例。
- 编写从 antd 5 直接使用迁移到 `lx-ui` 的指南。
- 根据真实项目反馈决定 P1 组件和 antd4 compat 包是否立项。

## 14. 首版验收标准

- 能在 React 18 和 React 19 项目中安装并使用，类型声明可用。
- 基础 P0 和四个业务 P0 都有 Dumi 示例、API 文档和测试。
- `lx-ui/antd` 可导出原生 Ant Design 5 组件，主包组件不会覆盖其命名。
- 三种风格、六个基础主题色、七套东方配色、light/dark、comfortable/compact 均可运行时切换并持久化。
- 在不支持 `backdrop-filter` 的浏览器中，glass 风格仍保持可读和可操作。
- 键盘流程、焦点、错误提示、对比度和 reduced motion 通过首版检查。
- ESM、CJS、类型声明、CSS、外置依赖 UMD 和 standalone UMD 均可构建。
- 参考项目 `D:\lxy\crm\lxComponent` 不被修改，新的实现全部位于 `F:\work\lz-ui`。

## 15. 待开发时确认的细节

以下内容不阻塞 Stitch 开始出第一版视觉稿，但在进入编码前需要最终定稿：

- 六个主题色是否需要替换为真实品牌色值。
- `QuickField` 的字段类型和校验能力是否覆盖图片、日期、标签、数字、文本和多行文本。
- `ProTable` 是否内置请求协议，还是只接收 `dataSource` 和 `request` 两种模式。
- `PageContainer` 是否包含权限按钮、页面级 loading 和离开确认。
- npm 私库的 registry、包发布权限和版本审批流程。
- 是否需要英文 locale、RTL 和时区配置的第一批示例；Tag 默认关闭名称保持中文，非中文宿主通过 `closable` 的 `aria-label` 显式提供名称，不读取 AntD 私有 locale 上下文。

## 16. 当前阶段交付边界

### 16.1 现在可以做

- 初始化目录、TypeScript、Dumi、Father、Vitest、ESLint、Prettier 和发布脚本。
- 建立主题类型协议、CSS cascade layer、入口和 subpath exports 的预留结构。
- 编写架构、代码格式、注释、性能、动画、测试、发布和组件模板文档。
- 建立脚手架检查，防止 UI 设计确认前误创建组件实现和页面 demo。

### 16.2 已解除门禁

- 具体组件的 JSX、CSS Modules、交互状态和动画实现。
- 主题 token 的最终色值、字体、阴影、圆角和控件高度。
- Dumi 组件 demo、examples 页面和视觉回归截图。
- `lx-ui/antd` 的最终显式导出清单。
- standalone UMD 的真实依赖打包、体积预算和浏览器兼容验证。

### 16.3 解除实现门禁的条件

Stitch 至少交付并确认以下内容后，才开始第一批组件：

1. 基础 token 表和命名规则。
2. 三种风格、六个品牌主题色、七套东方配色、light/dark 和两种密度的关键组件矩阵。
3. 组件的 default、hover、active、focus、disabled、loading、error、empty、selected 状态。
4. 交互动画的时长、缓动、进入/退出和 reduced motion 规则。
5. ProTable、SearchForm、QuickField、PageContainer 的页面组合稿。
6. 键盘焦点、错误提示、窄屏和 200%/400% 放大下的可访问性说明。
