---
title: Skeleton 骨架屏
group: Data Display
---

# Skeleton 骨架屏

用于加载阶段的结构占位，形状应与最终内容接近。

## 基础用法：头像与段落占位

loading 为 true 或省略时显示骨架，false 时显示 children。avatar、title、paragraph 控制占位结构，paragraph.rows 指定行数；active 仅控制动画，不触发请求。

<code src="../../../../docs/demos/skeleton-basic.tsx"></code>

## 加载、完成及失败

工具栏显式切换本地状态，失败重试恢复内容并把焦点放回完成加载按钮。示例预留一致最小区域。

<code src="../../../../docs/demos/skeleton.tsx"></code>

## 状态与受控协议

骨架只展示 loading，完成内容与失败恢复由宿主管理。切换失败不能保留永久骨架；重试动作卸载前将焦点移至稳定操作。

## API

从 `lx-ui` 根入口命名导入组件和对应类型。除扩展项外，其他属性沿用 [Ant Design 5 公开契约](https://ant.design/components/skeleton/cn/)；默认行为随安装的 AntD 5 版本生效，下表列出常用参数。

| 属性                            | 类型                         | 默认值  | 说明                |
| ------------------------------- | ---------------------------- | ------- | ------------------- |
| `loading`                       | `boolean`                    | `true`  | false 显示 children |
| `active`                        | `boolean`                    | `false` | 扫光动画            |
| `avatar`                        | `SkeletonProps['avatar']`    | `false` | 头像占位            |
| `title`                         | `SkeletonProps['title']`     | `true`  | 标题占位            |
| `paragraph`                     | `SkeletonProps['paragraph']` | `true`  | 段落及 rows         |
| `round`                         | `boolean`                    | `false` | 圆角占位            |
| `children`                      | `ReactNode`                  | `—`     | 完成内容            |
| `aria-label / aria-describedby` | `string`                     | `—`     | 区域说明            |

## 事件、Ref 与键盘

没有完成事件，loading 由宿主控制。加载区域具有 status/busy 语义，ref 是 HTMLDivElement 外层。lx-ui 不公开 Skeleton.Button 等静态成员，原生组合能力从 lx-ui/antd 引入。

## 主题与密度

展开示例的“主题设置”可切换 light/dark、comfortable/compact、三种外观、六个品牌色与七套东方配色。品牌色选择会清除东方配色；选择东方配色后由 palettePreset 决定视觉色阶。Provider 禁用持久化，主题操作不重置当前业务状态。

主题仅改变外观与间距，不改变记录、权限或页码。需要显式尺寸时使用当前组件公开支持的尺寸参数；表格行高使用独立 token。长内容应允许换行，宽表格在容器内滚动。

## 边界与性能

失败需恢复入口，不能永久展示骨架。减少占位行与布局偏移，active 不发请求；reduced motion 下动画关闭，真实请求由宿主处理取消和竞态。

## 设计与验证边界

示例对应 `UI/P0 基础组件-Data Display/` 的当前组件场景，所有恢复、失败与加载操作均为本地 React 状态，不发送网络请求。基础示例供观察单组件，交互示例说明宿主受控状态与恢复协议。静态检查不能替代明暗对比度、焦点、窄屏及 reduced motion 的独立浏览器验收。
