---
title: Radio 单选
group: Form
demo:
  defaultShowCode: false
---

# Radio 单选

用于少量互斥选择。整组取值使用命名导出的 RadioGroup；大量选项使用可搜索 Select。

## 最小使用

```tsx pure
import { LxConfigProvider, RadioGroup } from 'lx-ui';
import 'lx-ui/style.css';

export default function Demo() {
  return (
    <LxConfigProvider theme={{ persist: false }}>
      <RadioGroup
        aria-label="配送方式"
        defaultValue="standard"
        options={[
          { label: '标准', value: 'standard' },
          { label: '加急', value: 'express' },
        ]}
      />
    </LxConfigProvider>
  );
}
```

## 示例

### 默认值和禁用选项

<code src="../../../../docs/demos/form-doc-radio-basic.tsx" title="基础单选"></code>

### 受控按钮组与尺寸

三档按钮组共享受控值，各组操作都会更新当前周期。

<code src="../../../../docs/demos/form-doc-radio-controlled.tsx" title="受控与尺寸"></code>

## API

`RadioProps` 和 `RadioGroupProps` 保留 AntD >=5.24 <6公开属性。

| 属性                            | 类型                           | 默认    | 说明                                     |
| ------------------------------- | ------------------------------ | ------- | ---------------------------------------- |
| Radio.checked / defaultChecked  | boolean                        | false   | 单项受控值 / 初值                        |
| Radio.value                     | RadioProps['value']            | —       | 单项提交值                               |
| Radio.disabled                  | boolean                        | false   | 单项禁用                                 |
| RadioGroup.value / defaultValue | RadioGroupProps['value']       | —       | 整组受控值 / 初值                        |
| options                         | RadioGroupProps['options']     | —       | 标签、值、禁用配置或原生支持的简单选项   |
| optionType                      | 'default' \| 'button'          | default | 单选或按钮样式                           |
| size                            | 'small' \| 'middle' \| 'large' | middle  | 按钮组尺寸                               |
| buttonStyle                     | 'outline' \| 'solid'           | outline | 按钮选中样式                             |
| disabled                        | boolean                        | false   | 整组禁用                                 |
| onChange                        | RadioGroupProps['onChange']    | —       | 用户选择事件，event.target.value为选中值 |

程序化value更新不模拟onChange。`RadioRef` 是单项公开聚焦实例，支持focus/blur、input/nativeElement；`RadioGroup`ref为HTMLDivElement，不承诺单项聚焦方法。包装层也导出`Radio.Group`指向同一RadioGroup；示例使用命名导出便于明确导入。

## 表单、键盘和主题

### 事件参数

| 事件                | 参数与示例                                                             | 触发时机                         |
| ------------------- | ---------------------------------------------------------------------- | -------------------------------- |
| RadioGroup.onChange | RadioChangeEvent，`onChange={(event) => setValue(event.target.value)}` | 用户选择另一值；程序化更新不触发 |
| Radio.onChange      | RadioProps['onChange']，`event.target.checked/value`                   | 单项用户状态变化                 |

### 实例方法

单项用`useRef<RadioRef>(null)`，整组用`useRef<HTMLDivElement>(null)`。

| 成员                        | 用法                                          | 边界                                                                 |
| --------------------------- | --------------------------------------------- | -------------------------------------------------------------------- |
| Radio.focus(options?)       | `ref.current?.focus({ preventScroll: true })` | 聚焦单项输入；禁用项不可正常聚焦                                     |
| Radio.blur()                | `ref.current?.blur()`                         | 单项失焦，不改变组value                                              |
| Radio.input / nativeElement | `ref.current?.input`                          | 公开原生输入/根元素，可能为null                                      |
| RadioGroup原生div           | `groupRef.current?.getBoundingClientRect()`   | 无专属选项聚焦API；默认无tabIndex，不能期待div.focus把焦点送到某单项 |

FormItem name直接绑定RadioGroup的value/onChange，不用valuePropName="checked"。校验、异步选项失败与empty由宿主表单处理。Tab进入组，方向键移动选择，Space选择；label应明确组用途。主题控制密度、颜色和焦点，reduced motion遵循基线；选项稳定value不可取可变数组索引。真实视觉门禁另行验证。
