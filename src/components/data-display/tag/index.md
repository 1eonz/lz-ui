---
title: Tag 标签
group: Data Display
---

# Tag 标签

用于分类和处理状态。只展示状态用 Tag；筛选切换用独立导出的 CheckableTag。

## 基础用法：语义色与文字

传入 children 展示短标签，color 可用 blue 或 success/warning/error 语义值；不要只依赖颜色表达状态。需要筛选时单独导入 CheckableTag，checked 是必填受控值，没有 defaultChecked。

<code src="../../../../docs/demos/tag-basic.tsx"></code>

## 可关闭标签与受控筛选

关闭单条标签后，“恢复默认标签”会重置整组演示标签，并取消仍在等待的退出动画。每个关闭按钮通过 `closable` 的 `aria-label` 标明要移除的标签；示例也展示禁用的关闭按钮，以及“历史归档”筛选项被锁定的可见原因。关闭前会按设计稿淡出 120ms，系统启用减少动态效果时立即完成。

分类通过 `checked`/`onChange` 受控：“全部业务”与具体分类互斥，具体分类可多选；取消时只移除当前分类。示例只展示受控选中状态，不模拟数据过滤或查询，业务宿主应根据选中值更新结果。

标签移除时，如果焦点仍在该标签或页面主体，焦点会移到恢复操作；若用户期间主动移到其他控件，则保留新焦点位置。

<code src="../../../../docs/demos/tag.tsx"></code>

## 状态与受控协议

Tag 没有内建 loading/error；失败状态用明确文本和语义色。异步关闭在宿主等待结果或恢复数据；CheckableTag 可用 disabled 阻止切换。

CheckableTag 在精细指针下默认高度为 26px，面向 PC 后台密集筛选；检测到粗指针设备时，CheckableTag 和 lx-ui 提供的默认关闭按钮会通过 `--lx-control-target-touch-min` 扩大至至少 44×44 CSS px，兼顾触屏操作而不改变桌面密度。使用自定义 `closeIcon` 时，宿主需自行让按钮满足该目标尺寸。

## API

从 `lx-ui` 根入口命名导入组件和对应类型。除扩展项外，其他属性沿用 [Ant Design 5 公开契约](https://ant.design/components/tag/cn/)；默认行为随安装的 AntD 5 版本生效，下表列出常用参数。

<p id="tag-docs-table-hint" className="lx-docs-table-hint">
  表格可横向滚动；聚焦表格区域后按左右方向键浏览。
</p>

<p id="tag-api-table-hint" className="lx-docs-table-hint">
  主 API 表的属性列固定在左侧。
</p>

<div
  className="lx-docs-table lx-tag-api-table"
  role="region"
  tabindex="0"
  aria-label="Tag 属性参数表"
  aria-describedby="tag-docs-table-hint tag-api-table-hint"
>

| 属性        | 类型                                                                                | 默认值                                     | 说明                                                      |
| ----------- | ----------------------------------------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------- |
| `children`  | `ReactNode`                                                                         | `—`                                        | 标签内容                                                  |
| `color`     | `string`                                                                            | `—`                                        | 语义预设或自定义色                                        |
| `closable`  | `boolean \| ({ closeIcon?: ReactNode; disabled?: boolean } & React.AriaAttributes)` | 实例与全局均未启用时为 `false`             | 显示或配置关闭操作；沿用 AntD 公开 `TagProps['closable']` |
| `closeIcon` | `ReactNode`                                                                         | 显式 `closable` 且未自定义时为原生关闭按钮 | 自定义关闭节点；宿主负责键盘操作与可访问名称              |
| `onClose`   | `(event: MouseEvent<HTMLElement>) => void`                                          | `—`                                        | preventDefault 可取消关闭                                 |

</div>

lx-ui 提供的默认关闭按钮使用“关闭标签”。AntD 5 没有公开的 locale 读取 hook，lx-ui 不读取内部 `ConfigContext`；因此即使宿主设置了 `ConfigProvider.locale`，默认名称也不会自动切换。非中文项目应通过 `closable['aria-label']` 显式传入本地化名称；每个标签的实例名称也能明确描述移除对象：

```tsx
import enUS from 'antd/locale/en_US';
import { ConfigProvider } from 'antd';
import { Tag } from 'lx-ui';

function CustomerTags() {
  return (
    <ConfigProvider locale={enUS}>
      <Tag closable={{ 'aria-label': 'Remove customer tag' }}>Customer</Tag>
      <Tag closable={{ 'aria-label': 'Remove VIP customer tag' }}>VIP customer</Tag>
    </ConfigProvider>
  );
}
```

### CheckableTag

<div
  className="lx-docs-table"
  role="region"
  tabindex="0"
  aria-label="CheckableTag 属性参数表"
  aria-describedby="tag-docs-table-hint"
>

| 属性     | 类型                                   | 默认值 | 说明                      |
| -------- | -------------------------------------- | ------ | ------------------------- |
| checked  | boolean                                | 必填   | 当前选中状态，完全受控    |
| onChange | (checked: boolean) => void             | —      | 未取消激活请求的下一个值  |
| disabled | boolean                                | false  | 原生按钮禁用              |
| onClick  | `MouseEventHandler<HTMLButtonElement>` | —      | preventDefault 可取消切换 |
| ref      | `HTMLButtonElement`                    | —      | 实际按钮，可调用 focus    |

</div>

组件以命名导出 `CheckableTag` 使用，不提供 `Tag.CheckableTag`。其余原生按钮属性可传入。

## 事件、Ref 与键盘

<div
  className="lx-docs-table"
  role="region"
  tabindex="0"
  aria-label="Tag 事件参数表"
  aria-describedby="tag-docs-table-hint"
>

| 事件                  | 类型                                       | 触发时机                             |
| --------------------- | ------------------------------------------ | ------------------------------------ |
| onClose               | `(event: MouseEvent<HTMLElement>) => void` | 关闭按钮激活；取消默认行为可保留标签 |
| CheckableTag.onChange | `(checked: boolean) => void`               | 未取消的激活；宿主更新 checked       |

</div>

显式传入 `closable={true}` 或 `closable` 配置对象，并且未提供自定义关闭图标时，lx-ui 提供带可访问名称的原生关闭按钮。配置对象支持 `closeIcon`、`disabled` 和 React 的 ARIA 属性，具体能力沿用当前安装的 AntD 5.24+ 公开类型。默认关闭按钮会应用 `closable.disabled`；例如 `closable={{ disabled: true }}` 禁用关闭，不触发 `onClose`，也不删除标签。

### 自定义关闭图标与无障碍

<div
  className="lx-docs-table"
  role="region"
  tabindex="0"
  aria-label="Tag 自定义关闭图标无障碍责任表"
  aria-describedby="tag-docs-table-hint"
>

| 配置场景                                                      | 关闭图标来源         | 无障碍行为责任                                                                                                                  |
| ------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 单个标签显式设置 `closable`，未自定义图标                     | lx-ui 提供原生按钮   | lx-ui 提供按钮语义和中文默认名称；多个标签同时可关闭时，请用 `closable={{ 'aria-label': '移除客户标签' }}` 为每项设置唯一名称。 |
| 单个标签传入 `closeIcon` 或 `closable.closeIcon`              | 当前实例提供的节点   | 宿主负责键盘操作、可访问名称和禁用语义；`closable.disabled` 不会自动禁用自定义节点。                                            |
| `ConfigProvider` 全局启用 `tag.closable`，实例省略 `closable` | 全局 `tag.closeIcon` | AntD 使用全局图标；宿主需提供可聚焦、可键盘激活且有可访问名称的控件。lx-ui 不读取 AntD 内部 `ConfigContext`。                   |

</div>

实例显式传入 `closable` 时，lx-ui 为无障碍保证提供实例级原生按钮，因此会覆盖 AntD `ConfigProvider` 的全局 `tag.closeIcon`。若要使用自定义图标，应通过当前实例的 `closeIcon` 或 `closable.closeIcon` 显式传入；这保留了 AntD 的公开优先级，不依赖内部配置上下文。

自定义图标应使用真实按钮，并为动作提供准确名称：

```tsx
<Tag
  closable
  closeIcon={
    <button type="button" className="customerTagClose" aria-label="移除客户标签">
      删除
    </button>
  }
>
  客户
</Tag>
```

需要自定义关闭图标时，宿主可复用 lx-ui 的触屏尺寸 token：

```css
.customerTagClose {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

@media (any-pointer: coarse) {
  .customerTagClose {
    min-inline-size: var(--lx-control-target-touch-min);
    min-block-size: var(--lx-control-target-touch-min);
  }
}
```

Tag 的 ref 指向 `HTMLSpanElement`。CheckableTag 的 ref 指向 `HTMLButtonElement`，Tab 聚焦，Enter/Space 激活；onChange 返回请求切换到的布尔值，程序化更新 checked 不触发事件。

## 主题与密度

展开示例的“主题设置”可切换 light/dark、comfortable/compact、三种外观、六个品牌色与七套东方配色。品牌色选择会清除东方配色；选择东方配色后由 palettePreset 决定视觉色阶。Provider 禁用持久化，主题操作不重置当前业务状态。

主题仅改变外观与间距，不改变记录、权限或页码。需要显式尺寸时使用当前组件公开支持的尺寸参数；表格行高使用独立 token。长内容应允许换行，宽表格在容器内滚动。

## 边界与性能

不发起删除请求，异步失败由宿主恢复标签。使用稳定 key，相邻间距由父容器 gap 管理。

## 设计与验证边界

示例对应 `UI/P0 基础组件-Data Display/` 的当前组件场景，所有恢复、失败与加载操作均为本地 React 状态，不发送网络请求。基础示例供观察单组件，交互示例说明宿主受控状态与恢复协议。静态检查不能替代明暗对比度、焦点、窄屏及 reduced motion 的独立浏览器验收。
