---
title: DatePicker 日期
group: Form
demo:
  defaultShowCode: false
---

# DatePicker / DateRangePicker 日期

单日期与日期范围输入，值为Dayjs对象。时区、日期序列化和异步可用日期由宿主决定。

## 最小使用

```tsx pure
import dayjs from 'dayjs';
import { DatePicker, LxConfigProvider } from 'lx-ui';
import 'lx-ui/style.css';

export default function Demo() {
  return (
    <LxConfigProvider theme={{ persist: false }}>
      <DatePicker aria-label="交付日期" defaultValue={dayjs('2026-10-01')} />
    </LxConfigProvider>
  );
}
```

宿主项目应明确安装dayjs，字符串必须先转换为Dayjs，不传Date或日期字符串作为value。

## 示例

### 尺寸、月份与禁用

<code src="../../../../docs/demos/form-doc-date-basic.tsx" title="基础日期"></code>

### 受控日期与开放范围

disabledDate限制早于2026-10-01的日期；范围使用allowEmpty与公开presets，宿主格式化展示选择结果。

<code src="../../../../docs/demos/form-doc-date-range.tsx" title="受控与范围"></code>

## API

`DatePickerProps`与`DateRangePickerProps`保持AntD >=5.24 <6公开契约。

| 属性                       | 类型                                               | 默认               | 说明                                                           |
| -------------------------- | -------------------------------------------------- | ------------------ | -------------------------------------------------------------- |
| 单日期value / defaultValue | Dayjs \| null                                      | —                  | 受控 / 非受控初值；multiple另遵循公开类型                      |
| 范围value / defaultValue   | DateRangePickerProps['value']                      | —                  | 允许空边界的Dayjs元组或null                                    |
| onChange                   | 对应Props['onChange']                              | —                  | 单日期(date,dateString)，范围(dates,dateStrings)；清空可为null |
| format                     | 对应Props['format']                                | YYYY-MM-DD（日期） | 输入/展示格式，不决定服务器时区                                |
| picker                     | 'date' \| 'week' \| 'month' \| 'quarter' \| 'year' | date               | 选择粒度                                                       |
| showTime                   | boolean \| 公开时间配置                            | false              | 日期时间组合                                                   |
| disabledDate               | 对应Props['disabledDate']                          | —                  | 禁用日期判断，不是请求入口                                     |
| disabled                   | 单日期boolean；范围boolean或[boolean,boolean]      | false              | 禁用输入                                                       |
| allowClear                 | 对应Props['allowClear']                            | true               | 允许清空                                                       |
| size                       | 'small' \| 'middle' \| 'large'                     | 主题默认           | 显式尺寸                                                       |
| status                     | 'error' \| 'warning'                               | —                  | 校验视觉状态                                                   |
| 范围allowEmpty             | [boolean,boolean]                                  | [false,false]      | 是否允许开始/结束为空                                          |
| 范围presets                | DateRangePickerProps['presets']                    | —                  | 公开范围快捷选项                                               |
| onCalendarChange           | DateRangePickerProps['onCalendarChange']           | —                  | 范围面板中边界选择变化，未必是最终确认                         |

ref使用`DatePickerRef`，包装层公开focus(options?: FocusOptions)、blur和nativeElement。DateRangePicker当前共用该ref类型，不承诺按index聚焦某个边界；挂载后可用，卸载清空。不要使用未导出的DatePicker.RangePicker静态成员，使用DateRangePicker命名导出。

## 表单、键盘、主题和性能

### 事件参数

| 事件                     | 参数与示例                                                   | 触发时机                                   |
| ------------------------ | ------------------------------------------------------------ | ------------------------------------------ |
| DatePicker.onChange      | `(date,dateString)`；`onChange={(next) => setDate(next)}`    | 用户确认日期或清空，单日期next为Dayjs/null |
| DateRangePicker.onChange | `(dates,dateStrings)`；`onChange={(next) => setRange(next)}` | 范围确认/清空，保留公开可空元组类型        |
| onCalendarChange         | `(dates,dateStrings,info)`；info.range为start/end            | 范围边界面板选择，可能尚未形成最终值       |
| onOpenChange             | `(open:boolean)`                                             | 面板显隐改变，宿主受控open需同步更新       |

### 实例方法

单日期/范围均使用包装层公开`DatePickerRef`，挂载后可用。

| 成员            | 用法                                          | 边界                                            |
| --------------- | --------------------------------------------- | ----------------------------------------------- |
| focus(options?) | `ref.current?.focus({ preventScroll: true })` | 当前公开类型为FocusOptions，不承诺范围index扩展 |
| blur()          | `ref.current?.blur()`                         | 原生失焦，是否关闭面板遵循AntD                  |
| nativeElement   | `ref.current?.nativeElement`                  | 原生HTMLDivElement根；不要操作私有日历DOM       |

FormItem收集Dayjs值，提交后再按API约定format/ISO序列化。输入空值不等于业务失败；required校验由rules执行。Tab进入，方向键操作日历，Escape关闭，名称通过FormItem或aria属性提供。主题控制明暗、密度和焦点；范围窄屏容器要保留可用宽度，reduced motion遵循基线。disabledDate高频调用，应同步且轻量；远程可用日期先加载缓存，处理取消和失败。真实浏览器门禁另行验证。
