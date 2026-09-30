---
title: Select 选择器
group: Form
demo:
  defaultShowCode: false
---

# Select 选择器

用于从候选值中选择，支持搜索和多选。远程数据、取消、缓存与重试由宿主负责。

## 最小使用

```tsx pure
import { LxConfigProvider, Select } from 'lx-ui';
import 'lx-ui/style.css';

export default function Demo() {
  return (
    <LxConfigProvider theme={{ persist: false }}>
      <Select
        aria-label="地区"
        style={{ width: 240 }}
        defaultValue="east"
        options={[{ label: '华东', value: 'east' }]}
      />
    </LxConfigProvider>
  );
}
```

## 示例

### 尺寸与禁用

<code src="../../../../docs/demos/form-doc-select-basic.tsx" title="基础选择"></code>

### 搜索与受控多选

按label搜索中文部门，清除与选择都更新受控数组。

<code src="../../../../docs/demos/form-doc-select-search.tsx" title="搜索多选"></code>

### 空、加载和重试

本地数据模拟首次失败、重试成功，不发起网络请求；loading与disabled分别表达进度和交互策略。

<code src="../../../../docs/demos/form-doc-select-loading.tsx" title="数据恢复"></code>

## API

`SelectProps` 是 AntD >=5.24 <6公共类型别名，包装层未新增请求协议或静态Option。

| 属性                 | 类型                           | 默认                | 说明                                                |
| -------------------- | ------------------------------ | ------------------- | --------------------------------------------------- |
| value / defaultValue | SelectProps['value']           | —                   | 受控选择 / 非受控初值，模式和labelInValue影响值形状 |
| options              | SelectProps['options']         | —                   | 建议使用label/value稳定选项                         |
| mode                 | 'multiple' \| 'tags'           | —                   | 多选 / 可输入标签；默认单选                         |
| showSearch           | boolean                        | 单选false；多选true | 搜索输入                                            |
| optionFilterProp     | string                         | value               | options模式中文标签搜索建议label                    |
| filterOption         | SelectProps['filterOption']    | true                | 本地过滤；远程搜索通常false                         |
| allowClear           | SelectProps['allowClear']      | false               | 支持清空                                            |
| loading / disabled   | boolean                        | false               | 加载图形 / 禁用选择                                 |
| notFoundContent      | ReactNode                      | AntD空提示          | 无匹配内容                                          |
| status               | 'error' \| 'warning'           | —                   | 仅状态标记，非自动校验                              |
| size                 | 'small' \| 'middle' \| 'large' | 主题默认            | 显式尺寸                                            |
| virtual              | boolean                        | true                | 大候选列表保持虚拟化                                |
| onChange             | SelectProps['onChange']        | —                   | (value,option)，用户选择/清空触发                   |
| onSearch             | (value:string) =&gt; void      | —                   | 搜索输入更新，可接宿主防抖请求                      |
| onClear              | () =&gt; void                  | —                   | 用户清空触发                                        |

ref `SelectRef`支持focus/blur，公开实例还有scrollTo/nativeElement；在挂载后读取，不依赖私有DOM。FormItem收集value，无需手动重复checked绑定。5.24示例只使用该版本存在的公共API，不使用5.25新增popupRender。

## 主题、键盘和性能

### 事件参数

| 事件                  | 参数与示例                                                               | 触发时机                               |
| --------------------- | ------------------------------------------------------------------------ | -------------------------------------- |
| onChange              | `(value,option)`；多选value为数组，`onChange={(next) => setValue(next)}` | 用户选择、取消、清空；不是搜索请求回调 |
| onSearch              | `(query:string)`；`onSearch={(query) => scheduleSearch(query)}`          | 搜索输入变化；防抖与取消由宿主负责     |
| onSelect / onDeselect | 对应SelectProps成员的`(value,option)`                                    | 选择选项 / 多选移除选项                |
| onClear               | 无参数                                                                   | 用户清空，受控value仍须在onChange更新  |

### 实例方法

`useRef<SelectRef>(null)`，方法与公开成员在挂载后使用。

| 成员             | 用法                                   | 边界                                                     |
| ---------------- | -------------------------------------- | -------------------------------------------------------- |
| focus(options?)  | `ref.current?.focus()`                 | 聚焦选择器输入；禁用时不应期待交互                       |
| blur()           | `ref.current?.blur()`                  | 失焦，关闭行为遵循AntD                                   |
| scrollTo(config) | `ref.current?.scrollTo({ index: 20 })` | 公开虚拟列表滚动配置；需要有效候选及列表布局，非页面滚动 |
| nativeElement    | `ref.current?.nativeElement`           | 公开HTML根节点；不查询私有输入/列表层级                  |

提供FormItem label或aria-label；方向键导航、Enter选择、Escape关闭遵循AntD。主题决定根高度、密度、明暗与焦点；弹出内容通过Provider公开配置保持主题。reduced motion遵循主题基线。远程搜索必须处理取消和乱序，业务选中值不应因刷新选项被无意清空。使用options与virtual减少大量DOM；真实浏览器视觉尚待独立验收。
