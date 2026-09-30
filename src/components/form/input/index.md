---
title: Input 输入框
group: Form
demo:
  defaultShowCode: false
---

# Input 输入框

用于客户名称、编号、邮箱等单行文本；长备注使用独立命名导出的 `TextArea`。保留 AntD 5.24+ 的公开参数和实例方法，业务校验、请求和查询结果由宿主控制。

## 使用方法

```tsx pure
import { Input, FormItem, LxConfigProvider } from 'lx-ui';
import { Form } from 'lx-ui/antd';
import 'lx-ui/style.css';

export default function CustomerNameField() {
  return (
    <LxConfigProvider>
      <Form layout="vertical">
        <FormItem
          label="客户名称"
          name="customerName"
          rules={[{ required: true, message: '请输入客户名称' }]}
        >
          <Input placeholder="请输入客户名称" autoComplete="organization" />
        </FormItem>
      </Form>
    </LxConfigProvider>
  );
}
```

需要运行时主题时，在应用根部添加 `LxConfigProvider`。不要使用 placeholder 代替 label。`value` 配合 `onChange` 为受控模式，`defaultValue` 仅设置非受控初始值；进入 `FormItem name` 后由表单管理值，通常无需同时传入 `value`。

## 基础与受控输入

输入和清除会立即更新当前值；非受控示例仅使用 `defaultValue`。

<code src="../../../../docs/demos/input-basic.tsx"></code>

## 三种尺寸

显式 `small` 和 `large` 保留各自尺寸；默认或 `middle` 随舒适/紧凑密度调整。演示主题只作用于当前示例，切换不会清空输入。

<code src="../../../../docs/demos/input-size.tsx"></code>

## 校验、警告、禁用与只读

`status` 只表达视觉状态，不自动执行校验。错误示例在失焦后验证邮箱，使用 `aria-invalid` 和关联说明提供可访问反馈；实际表单推荐复用 `FormItem` 或 `DynamicForm` 的规则。

<code src="../../../../docs/demos/input-states.tsx"></code>

## 前后缀、组合与字数

`prefix/suffix` 位于输入边界内，`addonBefore/addonAfter` 用于外部组合。金额示例演示单位展示，精确数值计算和步进应使用 `InputNumber`。字数限制与计数可同时使用。

<code src="../../../../docs/demos/input-affixes.tsx"></code>

## 多行与自动高度

`TextArea` 独立导出，不使用 `Input.TextArea`。将 `autoSize` 限制在 3–6 行，避免长备注持续推移后续操作。

<code src="../../../../docs/demos/input-textarea.tsx"></code>

## 聚焦、全选与回车事件

通过公开 ref 调用 `focus`，查询由宿主处理。`onPressEnter` 只通知回车，不发送请求，也不保证表单不会提交；在真实查询表单中统一使用表单的提交事件。

<code src="../../../../docs/demos/input-ref.tsx"></code>

## Input 参数

其余原生输入属性及 AntD 公开 `InputProps` 继续透传；下表列出高频参数。API 不包含未导出的 `Input.Search/Password/Group`，原生补充组件可从 `lx-ui/antd` 使用。

| 参数                       | 类型                                                     | 默认值              | 说明                                                     |
| -------------------------- | -------------------------------------------------------- | ------------------- | -------------------------------------------------------- |
| `value`                    | `string \| number \| readonly string[]`                  | —                   | 受控值；编辑后需在 `onChange` 更新                       |
| `defaultValue`             | 同 `value`                                               | —                   | 非受控初始值，后续修改此参数不会重置输入                 |
| `size`                     | `'large' \| 'middle' \| 'small'`                         | Provider 尺寸或默认 | 大、中、小；默认密度由 lx 主题控制                       |
| `status`                   | `'error' \| 'warning'`                                   | —                   | 视觉状态，不运行规则                                     |
| `disabled`                 | `boolean`                                                | `false`             | 禁用输入和操作，不进入常规 Tab 顺序                      |
| `readOnly`                 | `boolean`                                                | `false`             | 可聚焦和复制，禁止编辑                                   |
| `allowClear`               | `boolean \| { clearIcon: ReactNode }`                    | `false`             | 清除按钮；受控模式同步触发 `onChange`                    |
| `prefix / suffix`          | `ReactNode`                                              | —                   | 输入内的前、后缀                                         |
| `addonBefore / addonAfter` | `ReactNode`                                              | —                   | 输入外的组合内容；宿主 AntD 新版可能提示迁移到组合布局   |
| `showCount`                | `boolean \| { formatter: Function }`                     | `false`             | 显示字数，formatter 具体类型见 `InputProps`              |
| `maxLength`                | `number`                                                 | —                   | 原生最大长度；受控外部值仍须由宿主保证限制               |
| `type`                     | 原生输入类型                                             | `'text'`            | 可使用 email/password；密码可见切换不是当前 Input 的能力 |
| `id / aria-describedby`    | `string`                                                 | —                   | 关联 label、帮助与错误说明                               |
| `autoComplete / inputMode` | 原生属性                                                 | —                   | 表单自动填充及输入键盘建议                               |
| `variant`                  | `'outlined' \| 'borderless' \| 'filled' \| 'underlined'` | `'outlined'`        | AntD 公开视觉变体；`underlined` 要求宿主 AntD 5.24+      |
| `className / style`        | `string / CSSProperties`                                 | —                   | 根节点样式，不增加额外焦点包装层                         |
| `classNames / styles`      | AntD 公开语义槽映射                                      | —                   | 自定义 input/prefix/suffix/count 等语义区域              |

## 事件

| 事件                  | 参数                              | 触发时机                                                           |
| --------------------- | --------------------------------- | ------------------------------------------------------------------ |
| `onChange`            | `ChangeEvent<HTMLInputElement>`   | 用户编辑或清除；读 `event.target.value`，不由程序化 props 更新触发 |
| `onPressEnter`        | `KeyboardEvent<HTMLInputElement>` | 用户按回车；不自动请求数据                                         |
| `onFocus / onBlur`    | `FocusEvent<HTMLInputElement>`    | 实际输入获取、失去焦点                                             |
| `onKeyDown / onKeyUp` | `KeyboardEvent<HTMLInputElement>` | 原生键盘事件；输入法组合阶段需由宿主识别                           |

## TextArea 参数

| 参数                                        | 类型                                                | 默认值      | 说明                                                 |
| ------------------------------------------- | --------------------------------------------------- | ----------- | ---------------------------------------------------- |
| `value / defaultValue`                      | 原生 textarea 值类型                                | —           | 受控与非受控协议同 Input                             |
| `rows`                                      | `number`                                            | —           | 固定可见行数                                         |
| `autoSize`                                  | `boolean \| { minRows?: number; maxRows?: number }` | `false`     | 内容自动高度；建议限制最大行数                       |
| `showCount / maxLength`                     | 同 AntD `TextAreaProps`                             | `false / —` | 计数与长度限制                                       |
| `allowClear / disabled / readOnly / status` | 同 Input                                            | 同 Input    | 清除、禁用、只读及视觉校验                           |
| `onChange / onPressEnter`                   | textarea 对应事件                                   | —           | 原生事件；多行中的回车通常用于换行，不应直接触发保存 |

## 实例方法

`InputRef` 与 `TextAreaRef` 是实例对象，不是 DOM 元素；挂载后可调用，隐藏/卸载后检查 `ref.current`。

| 成员                | 用法                                                         | 说明                                                  |
| ------------------- | ------------------------------------------------------------ | ----------------------------------------------------- |
| `focus(options?)`   | `ref.current?.focus({ cursor: 'all', preventScroll: true })` | `cursor` 可为 start/end/all，避免不必要滚动           |
| `blur()`            | `ref.current?.blur()`                                        | 移出输入焦点；不要用来掩盖校验错误                    |
| `input`             | `inputRef.current?.input`                                    | Input 的原生 input；优先使用公开方法                  |
| `nativeElement`     | `inputRef.current?.nativeElement`                            | Input 的展示根节点；有前后缀时不一定是 input          |
| `resizableTextArea` | `textAreaRef.current?.resizableTextArea`                     | AntD 公开 textarea 访问对象；不要依赖它的私有布局 DOM |

## 注意事项

- 输入必须具有 label 或明确的 `aria-label`；错误同时提供文字说明，不能只靠红色边框。
- 动态添加或移除 prefix/suffix/showCount 可能改变 AntD 根结构和焦点。需要保持结构时保留占位节点，再更改内容。
- 字符串金额不要直接用于财务计算；高精度数字使用 InputNumber 的 `stringMode`，解析和提交规则由宿主决定。
- 异步搜索由宿主处理防抖、取消和旧响应丢弃；普通 Input 不保存远程列表或业务 loading 状态。
- 主题、尺寸、reduced motion 的真实浏览器验收见项目审查记录；本页有可运行示例，不代表全部主题矩阵已经验证。
