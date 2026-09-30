---
title: Card 卡片
group: Data Display
---

承载一组相关信息，避免将完整页面每段都包成卡片或嵌套卡片。

## 基础用法：采购协议卡片

title 提供标题，extra 放补充信息或操作，children 放相关正文。size="small" 适合较密集工具区；边框与材质由 token 和 appearance 控制，避免额外套一层卡片。

<code src="../../../../docs/demos/card-basic.tsx"></code>

## 受控选项卡与加载

activeTabKey/onTabChange 配套；选项变化展示对应指标或审计内容。外部完成加载恢复正文。

<code src="../../../../docs/demos/card.tsx"></code>

## 状态与受控协议

loading 显示骨架，但错误与空内容由 children 明确表达。activeTabKey 为受控，defaultActiveTabKey 为非受控初始值；选项切换不会自动请求数据。

## API

从 `lx-ui` 根入口命名导入组件和对应类型。除扩展项外，其他属性沿用 [Ant Design 5 公开契约](https://ant.design/components/card/cn/)；默认行为随安装的 AntD 5 版本生效，下表列出常用参数。

| 属性                  | 类型                    | 默认值    | 说明           |
| --------------------- | ----------------------- | --------- | -------------- |
| `title / extra`       | `ReactNode`             | `—`       | 标题及右侧内容 |
| `children`            | `ReactNode`             | `—`       | 正文           |
| `loading`             | `boolean`               | `false`   | 骨架占位       |
| `bordered`            | `boolean`               | `true`    | 边框           |
| `size`                | `CardProps['size']`     | `default` | 尺寸           |
| `tabList`             | `CardProps['tabList']`  | `—`       | 选项条目       |
| `activeTabKey`        | `string`                | `—`       | 受控激活项     |
| `defaultActiveTabKey` | `string`                | `首项`    | 非受控初始项   |
| `onTabChange`         | `(key: string) => void` | `—`       | 切换事件       |
| `actions`             | `ReactNode[]`           | `—`       | 底部操作       |

## 事件、Ref 与键盘

| 事件        | 类型                    | 触发时机   |
| ----------- | ----------------------- | ---------- |
| onTabChange | `(key: string) => void` | 选项卡切换 |

onTabChange 返回 key，受控时宿主必须更新 activeTabKey；程序化更新不会模拟事件。ref 是 AntD Card 实际 HTMLDivElement 根节点，className/style 作用于同一节点，不再增加外层包装。extra/actions 生命周期由宿主管理。

## 主题与密度

展开示例的“主题设置”可切换 light/dark、comfortable/compact、三种外观、六个品牌色与七套东方配色。品牌色选择会清除东方配色；选择东方配色后由 palettePreset 决定视觉色阶。Provider 禁用持久化，主题操作不重置当前业务状态。

主题仅改变外观与间距，不改变记录、权限或页码。需要显式尺寸时使用当前组件公开支持的尺寸参数；表格行高使用独立 token。长内容应允许换行，宽表格在容器内滚动。

## 边界与性能

loading 不发起请求。内容高度由宿主约束，选项使用稳定 key，异步内容自行处理取消与失败。

## 设计与验证边界

示例对应 `UI/P0 基础组件-Data Display/` 的当前组件场景，所有恢复、失败与加载操作均为本地 React 状态，不发送网络请求。基础示例供观察单组件，交互示例说明宿主受控状态与恢复协议。静态检查不能替代明暗对比度、焦点、窄屏及 reduced motion 的独立浏览器验收。
