---
title: List 列表
group: Data Display
---

# List 列表

用于事务流和轻量记录；多列排序或复杂单元格应使用 Table。

## 基础用法：简单采购待办

dataSource 是记录数组，renderItem 返回 List.Item。复杂标题与描述用 List.Item.Meta；业务 key 必须稳定，可以通过 rowKey 或返回元素的 key 提供，不使用数组下标。

<code src="../../../../docs/demos/list-basic.tsx"></code>

## 交互示例：企业资金流水

示例展示收入、支出与转账。状态演示覆盖加载、错误、清空和恢复；恢复会同步记录与计数。加载更多按批追加本地数据，由 `Spin` 显示区域加载并播报已显示/剩余数量；重试和空态恢复后焦点回到“显示内容”。普通列表加载也可使用 List 的 `loading` 属性。

流水时间使用带偏移量的 ISO 8601 值，并由 `<time dateTime>` 提供机器可读语义；界面按 `Asia/Shanghai`（`UTC+08:00`）显示完整日期与时间，便于辨认跨年记录。实际业务时区和格式应由宿主按业务规则决定，不依赖浏览器本地时区。

<code src="../../../../docs/demos/list.tsx"></code>

## 状态与受控协议

`loading`、`locale.emptyText` 和错误结果分别展示加载、空与失败状态。清空和恢复会同步更新记录与计数；本地追加不发送网络请求。`List.Item` 和 `List.Item.Meta` 是公开组合成员。

## API

从 `lx-ui` 根入口命名导入组件和对应类型。除扩展项外，其他属性沿用 [Ant Design 5 公开契约](https://ant.design/components/list/cn/)；默认行为随安装的 AntD 5 版本生效，下表列出常用参数。

<p id="list-docs-table-hint" className="lx-docs-table-hint">
  窄屏下可左右滑动参数表；键盘用户聚焦表格区域后按左右方向键浏览。
</p>

<div
  className="lx-docs-table"
  role="region"
  tabIndex="0"
  aria-label="List 参数表"
  aria-describedby="list-docs-table-hint"
>

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

</div>

## 事件、Ref 与键盘

List 不定义统一的行内业务操作；在 `renderItem` 中按需组合宿主操作。`pagination.onChange` 返回页码；ref 是 HTMLDivElement 外层，用于测量。数据源与 `renderItem` 保留相同泛型 T。

## 主题与密度

展开示例的“主题设置”可切换 light/dark、comfortable/compact、三种外观、六个品牌色与七套东方配色。品牌色选择会清除东方配色；选择东方配色后由 palettePreset 决定视觉色阶。Provider 禁用持久化，主题操作不重置当前业务状态。

主题仅改变外观与间距，不改变记录、权限或页码。需要显式尺寸时使用当前组件公开支持的尺寸参数；表格行高使用独立 token。长内容应允许换行，宽表格在容器内滚动。

## 边界与性能

提供稳定 key；清空时记录和剩余数量均归零。请求竞态、权限与去重由宿主处理；没有内建虚拟列表，大数据先分页。

## 设计与验证边界

示例对应 `UI/P0 基础组件-Data Display/` 的当前组件场景，所有恢复、失败与加载操作均为本地 React 状态，不发送网络请求。基础示例供观察单组件，交互示例说明宿主受控状态与恢复协议。静态检查不能替代明暗对比度、焦点、窄屏及 reduced motion 的独立浏览器验收。
