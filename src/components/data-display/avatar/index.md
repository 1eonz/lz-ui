---
title: Avatar 头像
group: Data Display
---

# Avatar 头像

用于识别人员、团队或应用，仍需提供可读姓名。

## 基础用法：尺寸与团队头像

示例将大/中/小尺寸标签放在头像旁，应用头像展示方形 8px 圆角；Badge 与 48px 头像组合展示右下角 12px 成功状态点，并用“在线”文字避免状态只依赖颜色表达。传入 name 后，未传 children 时自动显示姓名缩写，并按姓名稳定映射身份色；显式 children（包括 null）、aria-label、alt、role 或背景样式优先。AvatarGroup 的 `max.count` 控制可见成员。交互示例将 `max.popover.trigger` 设为空数组，因此 `+N` 只显示数量。桌面鼠标悬停时，头像堆叠间距临时展开；键盘和触屏用户通过具名按钮查看全部成员。收起状态保持紧凑堆叠，头像提供完整 ARIA 名称与原生 `title`；展开状态以头像和可见全名组成名单网格，不要求触屏用户触发悬停提示。再次操作按钮即可收起。

<code src="../../../../docs/demos/avatar-basic.tsx"></code>

## 成员展开及图片失败

示例先加载仓库内的 `public/avatar-demo.svg` 离线插画，再通过无效图片地址触发 AntD 图片错误并回退到显式 children `LX`；“恢复头像图片”会重新加载本地资源，不请求外部服务。该插画是无网络依赖的组件示例，不代表真实人物照片。展开按钮通过 `aria-expanded` 和 `aria-controls` 公开成员组状态；AvatarGroup 是命名导出，不能写 Avatar.Group。

<code src="../../../../docs/demos/avatar.tsx"></code>

## 状态与受控协议

Avatar 的 onError 提供图片失败分支，children 是回退内容。没有内建业务加载/禁用；头像若承担导航应放在带可访问名称的实际按钮或链接中。

## API

从 `lx-ui` 根入口命名导入组件和对应类型。除扩展项外，其他属性沿用 [Ant Design 5 公开契约](https://ant.design/components/avatar/cn/)；默认行为随安装的 AntD 5 版本生效，下表列出常用参数。

| 属性              | 类型                      | 默认值    | 说明                                                                 |
| ----------------- | ------------------------- | --------- | -------------------------------------------------------------------- |
| `src`             | `ReactNode`               | `—`       | 图片地址或节点                                                       |
| `alt`             | `string`                  | `—`       | 图片替代文字                                                         |
| `name`            | `string`                  | `—`       | 姓名标识；派生缩写、可访问名称与稳定身份色                           |
| `title`           | `string`                  | `—`       | 原生悬停提示；与可访问名称相同时应用 `aria-description` 提供不同说明 |
| `children`        | `ReactNode`               | `—`       | 文字或图标回退；显式传入 null 也会关闭自动缩写                       |
| `size`            | `AvatarProps['size']`     | `default` | 数值、预设或响应式尺寸                                               |
| `shape`           | `AvatarProps['shape']`    | `circle`  | circle/square                                                        |
| `onError`         | `() => boolean \| void`   | `—`       | 返回 false 阻止默认回退                                              |
| `AvatarGroup.max` | `AvatarGroupProps['max']` | `—`       | 最大可见数和省略配置                                                 |

## 事件、Ref 与键盘

| 事件    | 类型                    | 触发时机                          |
| ------- | ----------------------- | --------------------------------- |
| onError | `() => boolean \| void` | 图片失败；返回 false 取消默认回退 |

onError 在图片失败时触发；希望文字回退时不要返回 false。Avatar ref 是实际 HTMLSpanElement；AvatarGroup ref 与 style 指向 lx-ui 的 HTMLDivElement 容器。AvatarGroup 的 className 同时附加到该容器和 AntD 公开的 Group 根节点，宿主可通过同一个 CSS Module 类布局成员。

AvatarGroup 使用 `max.count` 且未指定 `max.popover.trigger` 时，沿用 AntD 默认的 hover 弹层；`+N` 头像不是键盘焦点入口。需要键盘可用的展开方式时，可像交互示例一样设置 `popover.trigger: []`，再提供具名按钮切换可见数量，并用 `aria-expanded`、`aria-controls` 描述状态。

## 主题与密度

展开示例的“主题设置”可切换 light/dark、comfortable/compact、三种外观、六个品牌色与七套东方配色。品牌色选择会清除东方配色；选择东方配色后由 palettePreset 决定视觉色阶。Provider 禁用持久化，主题操作不重置当前业务状态。

主题仅改变外观与间距，不改变记录、权限或页码。需要显式尺寸时使用当前组件公开支持的尺寸参数；表格行高使用独立 token。长内容应允许换行，宽表格在容器内滚动。

## 边界与性能

### 身份色

name 身份色来自高对比度固定色阶，不随品牌主题和明暗切换变化；同一姓名跨渲染稳定映射。颜色数有限，不同姓名可能共享颜色，因此不能用颜色作为唯一身份信号。宿主可通过显式背景样式覆盖身份色。

### 缩写兼容

姓名缩写优先使用 `Intl.Segmenter`；Node 18.18+ 和当前 Chromium/WebKit 文档验收环境均提供该 API。缺少 API 时，回退逻辑覆盖组合符号、常见印度语连写、肤色修饰符、区域旗帜、国旗 tag 序列和 ZWJ 序列，但不是完整的 Unicode UAX #29 实现。

SSR 服务端与客户端若使用不同的分段路径，例如服务端有 `Intl.Segmenter`、旧浏览器客户端没有，复杂字素簇可能生成不同缩写并造成 hydration 文本不一致。需要严格一致时，请通过 `children` 显式提供缩写。

### 宿主职责

预留图片尺寸避免跳动，并提供 alt 或姓名标签。图片鉴权、上传和网络重试由宿主处理；大量成员列表也应由宿主限制显示数量。

## 设计与验证边界

示例对应 `UI/P0 基础组件-Data Display/` 的当前组件场景；头像插画来自本地静态资源，失败和恢复操作只切换本地 React 状态，不调用业务 API。基础示例供观察单组件，交互示例说明宿主受控状态与恢复协议。静态检查不能替代明暗对比度、焦点、窄屏及 reduced motion 的独立浏览器验收。
