---
title: Card 卡片
group: Data Display
---

# Card 卡片

承载一组相关信息，避免将完整页面每段都包成卡片或嵌套卡片。

## 基础用法

title 提供标题，extra 放补充信息或操作，children 放相关正文。size="small" 适合较密集工具区；边框与材质由 token 和 appearance 控制，避免额外套一层卡片。合同编号和签约机构各占一行，编号保持完整显示。

<code src="../../../../docs/demos/card-basic.tsx"></code>

## 三种外观

比较 Business、Soft、Glass 三种实际组件主题。明暗、密度、品牌色和东方配色由主题设置同步到三张卡片。

<code src="../../../../docs/demos/card-appearances.tsx"></code>

## 受控 Tabs 面板与加载

演示受控 Tabs 面板、业务指标切换与加载恢复，并随卡片宽度调整布局。

<code src="../../../../docs/demos/card.tsx"></code>

<details>
<summary>技术说明</summary>

响应式布局按 Card 内容宽度变化，而非固定视口：宽于 560px 时指标为四列，361–560px 为两列，360px 及以下为单列；464px 及以下时将数据周期移到当前面板开头；内容宽度 216–320px 时使用“结算概况”“供应风险”“承运审计”短标签，内容宽度不超过 215px 时进一步显示“结算”“风控”“审计”两字超短标签。极窄模式下每个标签的触控目标至少为 44×44px。

示例通过 `Card` 与 `lx-ui/antd` 的 `Tabs` 组合，将真实面板放在卡片内。`Tabs` 由 `activeKey/onChange` 受控，`items[].children` 提供各面板内容；对应的公开 `tabpanel`、`aria-labelledby` 和 `aria-controls` 互相关联。桌面周期标记显示在标签栏右侧，窄屏时移动到当前面板开头；资金结算和供应链风险显示“近 30 天”，承运审计显示“本季度”。窄屏标签和两字超短标签均保留完整可访问名称，字号沿用 Tabs 默认样式。加载期间禁用触发按钮并把焦点交给已启用的完成按钮，操作完成后恢复当前面板和触发按钮焦点。指标内容按 Stitch 的 Advanced Card 设计稿整理，包括同比、币种、承运数量、预警阈值和合格等级；布局通过公开的 `styles.body`、`tabBarStyle` 与 CSS Module 实现，不依赖 AntD 私有选择器。

</details>

## 状态与受控协议

`loading` 只控制骨架，不发起请求，也不会自动播报状态；宿主应在需要时设置 `aria-busy` 并提供 `role="status"` 或合适的 live region。错误和空内容由 `children` 明确表达，恢复动作由宿主提供。`activeTabKey` 为受控，`defaultActiveTabKey` 为非受控初始值；选项切换不会自动请求数据。

## 空态与错误恢复

`Empty` 用于无匹配记录，`Alert` 用于请求失败；分别提供创建或重试动作。示例只切换本地状态，不请求网络。

<code src="../../../../docs/demos/card-states.tsx"></code>

## API

从 `lx-ui` 根入口命名导入组件和对应类型。除扩展项外，其他属性沿用 [Ant Design 5 公开契约](https://ant.design/components/card/cn/)；默认行为随安装的 AntD 5 版本生效，下表列出常用参数。

<p id="card-docs-table-hint" className="lx-docs-table-hint">
  窄屏下可左右滑动参数表；键盘用户聚焦表格区域后按左右方向键浏览，属性列保持可见。
</p>

<div
  className="lx-docs-table lx-card-api-table"
  role="region"
  tabIndex="0"
  aria-label="Card API 参数表"
  aria-describedby="card-docs-table-hint"
>

| 属性                  | 类型                    | 默认值    | 说明                                                                                                   |
| --------------------- | ----------------------- | --------- | ------------------------------------------------------------------------------------------------------ |
| `title / extra`       | `ReactNode`             | `—`       | 标题及右侧内容                                                                                         |
| `children`            | `ReactNode`             | `—`       | 正文                                                                                                   |
| `loading`             | `boolean`               | `false`   | 骨架占位                                                                                               |
| `bordered`            | `boolean`               | `true`    | 边框                                                                                                   |
| `size`                | `CardProps['size']`     | `default` | 尺寸                                                                                                   |
| `tabList`             | `CardProps['tabList']`  | `—`       | 内置标题区标签；其生成面板不关联 `Card.children`，需要真实面板语义时请组合公开 `Tabs items[].children` |
| `activeTabKey`        | `string`                | `—`       | 受控激活项                                                                                             |
| `defaultActiveTabKey` | `string`                | `首项`    | 非受控初始项                                                                                           |
| `onTabChange`         | `(key: string) => void` | `—`       | 切换事件                                                                                               |
| `actions`             | `ReactNode[]`           | `—`       | 底部操作                                                                                               |

</div>

## 事件、Ref 与键盘

| 事件        | 类型                    | 触发时机   |
| ----------- | ----------------------- | ---------- |
| onTabChange | `(key: string) => void` | 选项卡切换 |

Card 自带 `tabList` 时，`onTabChange` 返回 key，受控时宿主必须更新 `activeTabKey`；程序化更新不会模拟事件。ref 是 AntD Card 实际 HTMLDivElement 根节点，className/style 作用于同一节点，不再增加外层包装。extra/actions 生命周期由宿主管理。

Card 自带 `tabList` 时，方向键移动焦点，Enter 或 Space 激活选项。当前 Ant Design Card 会把 `tabList` 渲染为标题区 Tabs，而 `Card.children` 仍独立渲染在正文；生成的 `tabpanel` 不承载这份正文，tab 的 `aria-controls` 也未关联该正文。这项 Card 原生契约限制仍作为 P2 跟踪。需要真实面板语义时，使用公开 `Tabs` 的 `items[].children` API 组合内容，如上方主示例。

## 主题与密度

展开示例的“主题设置”可切换 light/dark、comfortable/compact、六个品牌色与七套东方配色；三种外观比较示例会将这些主题选择同步到 Business、Soft、Glass 三个 Provider。品牌色选择会清除东方配色；选择东方配色后由 palettePreset 决定视觉色阶。Provider 禁用持久化，主题操作不重置当前业务状态。

主题仅改变外观与间距，不改变记录、权限或页码。需要显式尺寸时使用当前组件公开支持的尺寸参数；表格行高使用独立 token。长内容应允许换行，宽表格在容器内滚动。

## 边界与性能

loading 不发起请求。内容高度由宿主约束，选项使用稳定 key，异步内容自行处理取消与失败。

## 设计与验证边界

示例对应 `UI/P0 基础组件-Data Display/` 的当前组件场景，所有恢复、失败与加载操作均为本地 React 状态，不发送网络请求。基础示例供观察单组件，交互示例说明宿主受控状态与恢复协议。静态检查不能替代明暗对比度、焦点、窄屏及 reduced motion 的独立浏览器验收。
