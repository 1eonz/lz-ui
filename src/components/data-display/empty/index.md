---
title: Empty 空状态
group: Data Display
---

展示集合为空或筛选无匹配的中性说明，不能把失败或无权限伪装成暂无数据。

## 基础用法：默认与小尺寸

description 描述无数据原因，variant="small" 适用于嵌入集合。没有恢复动作时可不传 action；需要创建或清除筛选时 action 传实际绑定回调的按钮。

<code src="../../../../docs/demos/empty-basic.tsx"></code>

## 创建记录与恢复筛选

创建实际添加本地订单；输入不匹配编号显示 small 空状态，清除筛选恢复。动作卸载前焦点回到稳定输入框。

<code src="../../../../docs/demos/empty.tsx"></code>

## 状态与受控协议

空状态并不表示加载失败；创建和筛选操作由宿主更新记录。缺少权限或请求错误应给对应反馈与恢复入口，避免用户在空状态里重复创建。

## API

从 `lx-ui` 根入口命名导入组件和对应类型。除扩展项外，其他属性沿用 [Ant Design 5 公开契约](https://ant.design/components/empty/cn/)；默认行为随安装的 AntD 5 版本生效，下表列出常用参数。

| 属性          | 类型                   | 默认值      | 说明                     |
| ------------- | ---------------------- | ----------- | ------------------------ |
| `description` | `ReactNode`            | `AntD 默认` | 可读说明，可 false 隐藏  |
| `action`      | `ReactNode`            | `—`         | 优先于 children 的操作区 |
| `children`    | `ReactNode`            | `—`         | 兼容底部内容             |
| `variant`     | `'default' \| 'small'` | `default`   | 尺寸                     |
| `image`       | `ReactNode`            | `AntD 默认` | 自定义图像               |
| `imageStyle`  | `CSSProperties`        | `—`         | 图像样式                 |

## 事件、Ref 与键盘

没有创建或重试事件；action 的按钮自行绑定操作。ref 是 HTMLDivElement 外层，不暴露 AntD 内部图像。组件没有自动 aria-live，宿主通过状态消息播报。

## 主题与密度

展开示例的“主题设置”可切换 light/dark、comfortable/compact、三种外观、六个品牌色与七套东方配色。品牌色选择会清除东方配色；选择东方配色后由 palettePreset 决定视觉色阶。Provider 禁用持久化，主题操作不重置当前业务状态。

主题仅改变外观与间距，不改变记录、权限或页码。需要显式尺寸时使用当前组件公开支持的尺寸参数；表格行高使用独立 token。长内容应允许换行，宽表格在容器内滚动。

## 边界与性能

不请求、不缓存、不判断权限。说明原因及下一步，不需要操作可省略 action；插画不能独自表达空状态。

## 设计与验证边界

示例对应 `UI/P0 基础组件-Data Display/` 的当前组件场景，所有恢复、失败与加载操作均为本地 React 状态，不发送网络请求。基础示例供观察单组件，交互示例说明宿主受控状态与恢复协议。静态检查不能替代明暗对比度、焦点、窄屏及 reduced motion 的独立浏览器验收。
