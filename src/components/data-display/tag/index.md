---
title: Tag 标签
group: Data Display
---

用于分类和处理状态。只展示状态用 Tag；筛选切换用独立导出的 CheckableTag。

## 基础用法：语义色与文字

传入 children 展示短标签，color 可用 blue 或 success/warning/error 语义值；不要只依赖颜色表达状态。需要筛选时单独导入 CheckableTag，checked 是必填受控值，没有 defaultChecked。

<code src="../../../../docs/demos/tag-basic.tsx"></code>

## 可关闭标签与受控筛选

关闭删除标签，恢复按钮还原数据；分类通过 checked/onChange 受控。关闭按钮卸载前焦点回到恢复操作。

<code src="../../../../docs/demos/tag.tsx"></code>

## 状态与受控协议

Tag 没有内建 loading/error；失败状态用明确文本和语义色。异步关闭在宿主等待结果或恢复数据；CheckableTag 可用 disabled 阻止切换。

## API

从 `lx-ui` 根入口命名导入组件和对应类型。除扩展项外，其他属性沿用 [Ant Design 5 公开契约](https://ant.design/components/tag/cn/)；默认行为随安装的 AntD 5 版本生效，下表列出常用参数。

| 属性        | 类型                                                                                | 默认值                                     | 说明                                                      |
| ----------- | ----------------------------------------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------- |
| `children`  | `ReactNode`                                                                         | `—`                                        | 标签内容                                                  |
| `color`     | `string`                                                                            | `—`                                        | 语义预设或自定义色                                        |
| `closable`  | `boolean \| ({ closeIcon?: ReactNode; disabled?: boolean } & React.AriaAttributes)` | `false`（未配置全局关闭时）                | 显示或配置关闭操作；沿用 AntD 公开 `TagProps['closable']` |
| `closeIcon` | `ReactNode`                                                                         | 显式 `closable` 且未自定义时为原生关闭按钮 | 自定义关闭节点；宿主负责键盘操作与可访问名称              |
| `onClose`   | `(event: MouseEvent<HTMLElement>) => void`                                          | `—`                                        | preventDefault 可取消关闭                                 |

### CheckableTag

| 属性     | 类型                                 | 默认值 | 说明                      |
| -------- | ------------------------------------ | ------ | ------------------------- |
| checked  | boolean                              | 必填   | 当前选中状态，完全受控    |
| onChange | (checked: boolean) => void           | —      | 未取消激活请求的下一个值  |
| disabled | boolean                              | false  | 原生按钮禁用              |
| onClick  | MouseEventHandler<HTMLButtonElement> | —      | preventDefault 可取消切换 |
| ref      | HTMLButtonElement                    | —      | 实际按钮，可调用 focus    |

组件以命名导出 `CheckableTag` 使用，不提供 `Tag.CheckableTag`。其余原生按钮属性可传入。

## 事件、Ref 与键盘

| 事件                  | 类型                                       | 触发时机                             |
| --------------------- | ------------------------------------------ | ------------------------------------ |
| onClose               | `(event: MouseEvent<HTMLElement>) => void` | 关闭按钮激活；取消默认行为可保留标签 |
| CheckableTag.onChange | `(checked: boolean) => void`               | 未取消的激活；宿主更新 checked       |

显式传入 `closable={true}` 或 `closable` 配置对象，并且未提供自定义关闭图标时，lx-ui 提供带可访问名称的原生关闭按钮。配置对象支持 `closeIcon`、`disabled` 和 React 的 ARIA 属性，具体能力沿用当前安装的 AntD 5.24+ 公开类型。默认关闭按钮会应用 `closable.disabled`；例如 `closable={{ disabled: true }}` 禁用关闭，不触发 `onClose`，也不删除标签。

通过 `ConfigProvider` 的 `tag.closable` 全局启用关闭时，lx-ui 不自动注入原生关闭按钮；宿主应通过全局 `tag.closeIcon` 提供支持键盘操作且具有可访问名称的关闭节点。显式传入 `closeIcon` 或 `closable.closeIcon` 时也由宿主承担键盘、名称和禁用行为的责任，需在自定义按钮上显式应用 `disabled`，不能假设 `closable.disabled` 会自动禁用自定义节点；普通展示图标本身不能保证 Tab 聚焦或 Enter/Space 激活。

Tag 的 ref 指向 HTMLSpanElement。CheckableTag 的 ref 指向 HTMLButtonElement，Tab 聚焦，Enter/Space 激活；onChange 返回请求切换到的布尔值，程序化更新 checked 不触发事件。

## 主题与密度

展开示例的“主题设置”可切换 light/dark、comfortable/compact、三种外观、六个品牌色与七套东方配色。品牌色选择会清除东方配色；选择东方配色后由 palettePreset 决定视觉色阶。Provider 禁用持久化，主题操作不重置当前业务状态。

主题仅改变外观与间距，不改变记录、权限或页码。需要显式尺寸时使用当前组件公开支持的尺寸参数；表格行高使用独立 token。长内容应允许换行，宽表格在容器内滚动。

## 边界与性能

不发起删除请求，异步失败由宿主恢复标签。使用稳定 key，相邻间距由父容器 gap 管理。

## 设计与验证边界

示例对应 `UI/P0 基础组件-Data Display/` 的当前组件场景，所有恢复、失败与加载操作均为本地 React 状态，不发送网络请求。基础示例供观察单组件，交互示例说明宿主受控状态与恢复协议。静态检查不能替代明暗对比度、焦点、窄屏及 reduced motion 的独立浏览器验收。
