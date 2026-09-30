---
title: Avatar 头像
group: Data Display
---

用于识别人员、团队或应用，仍需提供可读姓名。

## 基础用法：尺寸与团队头像

size 可传 48/36/24 等显式尺寸，shape="square" 表示应用头像。children 是文字回退，src 是图片内容。AvatarGroup 的 max.count 控制可见成员，需从根入口分别导入 Avatar 与 AvatarGroup。

<code src="../../../../docs/demos/avatar-basic.tsx"></code>

## 成员展开及图片失败

模拟无效图片地址由 AntD 回退到 children；恢复姓名头像不依赖网络。AvatarGroup 是命名导出，不能写 Avatar.Group。

<code src="../../../../docs/demos/avatar.tsx"></code>

## 状态与受控协议

Avatar 的 onError 提供图片失败分支，children 是回退内容。没有内建业务加载/禁用；头像若承担导航应放在带可访问名称的实际按钮或链接中。

## API

从 `lx-ui` 根入口命名导入组件和对应类型。除扩展项外，其他属性沿用 [Ant Design 5 公开契约](https://ant.design/components/avatar/cn/)；默认行为随安装的 AntD 5 版本生效，下表列出常用参数。

| 属性              | 类型                      | 默认值    | 说明                    |
| ----------------- | ------------------------- | --------- | ----------------------- |
| `src`             | `ReactNode`               | `—`       | 图片地址或节点          |
| `alt`             | `string`                  | `—`       | 图片替代文字            |
| `children`        | `ReactNode`               | `—`       | 文字或图标回退          |
| `size`            | `AvatarProps['size']`     | `default` | 数值、预设或响应式尺寸  |
| `shape`           | `AvatarProps['shape']`    | `circle`  | circle/square           |
| `onError`         | `() => boolean \| void`   | `—`       | 返回 false 阻止默认回退 |
| `AvatarGroup.max` | `AvatarGroupProps['max']` | `—`       | 最大可见数和省略配置    |

## 事件、Ref 与键盘

| 事件    | 类型                    | 触发时机                          |
| ------- | ----------------------- | --------------------------------- |
| onError | `() => boolean \| void` | 图片失败；返回 false 取消默认回退 |

onError 在图片失败时触发；希望文字回退时不要返回 false。Avatar ref 是实际 HTMLSpanElement；AvatarGroup ref 是 lx-ui 的 HTMLDivElement 根容器，使用 inline-flex 保持行内头像组语义。AvatarGroup 的 className、style 与 ref 作用于同一根节点。

## 主题与密度

展开示例的“主题设置”可切换 light/dark、comfortable/compact、三种外观、六个品牌色与七套东方配色。品牌色选择会清除东方配色；选择东方配色后由 palettePreset 决定视觉色阶。Provider 禁用持久化，主题操作不重置当前业务状态。

主题仅改变外观与间距，不改变记录、权限或页码。需要显式尺寸时使用当前组件公开支持的尺寸参数；表格行高使用独立 token。长内容应允许换行，宽表格在容器内滚动。

## 边界与性能

预留图片尺寸避免跳动，提供 alt 或姓名标签。鉴权、上传与网络重试由宿主处理；大量团队成员限制显示数量。

## 设计与验证边界

示例对应 `UI/P0 基础组件-Data Display/` 的当前组件场景，所有恢复、失败与加载操作均为本地 React 状态，不发送网络请求。基础示例供观察单组件，交互示例说明宿主受控状态与恢复协议。静态检查不能替代明暗对比度、焦点、窄屏及 reduced motion 的独立浏览器验收。
