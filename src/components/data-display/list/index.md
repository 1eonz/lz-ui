---
title: List 列表
group: Data Display
---

# List 列表

用于事务流和轻量记录；多列排序或复杂单元格应使用 Table。

## 基础用法：简单采购待办

dataSource 是记录数组，renderItem 返回 List.Item。复杂标题与描述用 List.Item.Meta；业务 key 必须稳定，可以通过 rowKey 或返回元素的 key 提供，不使用数组下标。

<code src="../../../../docs/demos/list-basic.tsx"></code>

## 事务完成、空状态与恢复

完成更新事务，清空同时重置完成记录。重试和空状态恢复前焦点移到常驻显示内容按钮。List.Item 和 List.Item.Meta 是公开组合成员。

<code src="../../../../docs/demos/list.tsx"></code>

## 状态与受控协议

loading、locale.emptyText 和业务错误恢复分别处理加载、空与失败；完成、清空和恢复更新同一份数据协议，状态消息不能报告已不存在的记录。

## API

从 `lx-ui` 根入口命名导入组件和对应类型。除扩展项外，其他属性沿用 [Ant Design 5 公开契约](https://ant.design/components/list/cn/)；默认行为随安装的 AntD 5 版本生效，下表列出常用参数。

| 属性              | 类型                                    | 默认值      | 说明      |
| ----------------- | --------------------------------------- | ----------- | --------- |
| `dataSource`      | `T[]`                                   | `—`         | 记录集合  |
| `renderItem`      | `(item: T, index: number) => ReactNode` | `—`         | 记录渲染  |
| `rowKey`          | `ListProps<T>['rowKey']`                | `—`         | 稳定标识  |
| `header / footer` | `ReactNode`                             | `—`         | 头尾内容  |
| `loading`         | `ListProps<T>['loading']`               | `false`     | 加载状态  |
| `pagination`      | `ListProps<T>['pagination']`            | `false`     | 分页配置  |
| `locale`          | `ListProps<T>['locale']`                | `AntD 默认` | emptyText |
| `split`           | `boolean`                               | `true`      | 分隔线    |
| `size`            | `ListProps<T>['size']`                  | `default`   | 尺寸      |

## 事件、Ref 与键盘

没有统一业务操作回调，在 renderItem 绑定按钮。pagination.onChange 返回页码；ref 是 HTMLDivElement 外层，用于测量。数据源与 renderItem 保留相同泛型 T。

## 主题与密度

展开示例的“主题设置”可切换 light/dark、comfortable/compact、三种外观、六个品牌色与七套东方配色。品牌色选择会清除东方配色；选择东方配色后由 palettePreset 决定视觉色阶。Provider 禁用持久化，主题操作不重置当前业务状态。

主题仅改变外观与间距，不改变记录、权限或页码。需要显式尺寸时使用当前组件公开支持的尺寸参数；表格行高使用独立 token。长内容应允许换行，宽表格在容器内滚动。

## 边界与性能

提供稳定 key，清空时完成状态不能保留为虚假计数。请求竞态、权限与去重由宿主处理；没有内建虚拟列表，大数据先分页。

## 设计与验证边界

示例对应 `UI/P0 基础组件-Data Display/` 的当前组件场景，所有恢复、失败与加载操作均为本地 React 状态，不发送网络请求。基础示例供观察单组件，交互示例说明宿主受控状态与恢复协议。静态检查不能替代明暗对比度、焦点、窄屏及 reduced motion 的独立浏览器验收。
