---
title: Checkbox 复选框
group: Form
demo:
  defaultShowCode: false
---

# Checkbox 复选框

用于可同时选择的布尔选项。提交后生效的授权或批量范围用 Checkbox，即时设置可用 Switch。

## 最小使用

```tsx pure
import { Checkbox, LxConfigProvider } from 'lx-ui';
import 'lx-ui/style.css';

export default function Demo() {
  return (
    <LxConfigProvider theme={{ persist: false }}>
      <Checkbox defaultChecked>包含已归档客户</Checkbox>
    </LxConfigProvider>
  );
}
```

## 示例

### 基础与禁用

defaultChecked 只决定初始状态；提供可见文字作为名称。

<code src="../../../../docs/demos/form-doc-checkbox-basic.tsx" title="基础与禁用"></code>

### 受控与半选

全选与子项同步更新；indeterminate 仅表达部分选择，不改变 checked 值。

<code src="../../../../docs/demos/form-doc-checkbox-controlled.tsx" title="受控与半选"></code>

## API

兼容 AntD >=5.24 <6，`CheckboxProps` 为 AntD 公开属性别名。

| 属性                     | 类型                      | 默认  | 说明                                         |
| ------------------------ | ------------------------- | ----- | -------------------------------------------- |
| checked / defaultChecked | boolean                   | false | 受控值 / 非受控初值，不要同时使用            |
| indeterminate            | boolean                   | false | 半选视觉状态                                 |
| disabled                 | boolean                   | false | 原生禁用，阻止用户切换                       |
| children                 | ReactNode                 | —     | 可见标签                                     |
| onChange                 | CheckboxProps['onChange'] | —     | 用户改变时接收事件，读取event.target.checked |
| id / name                | string                    | —     | 标签关联 / 原生字段名                        |
| className / style        | string / CSSProperties    | —     | 公开样式透传                                 |

程序化修改 checked 不触发 onChange。ref 类型 `CheckboxRef` 提供 `focus(options?: FocusOptions)`、`blur()`、`input` 和 `nativeElement`；挂载后读取，卸载后current为null。不存在 `Checkbox.Group` 包装导出，需要分组时自行组合或使用 `lx-ui/antd` 的 Checkbox.Group。

## 表单与边界

### 事件参数

| 事件             | 参数与示例                                                                                  | 触发时机                              |
| ---------------- | ------------------------------------------------------------------------------------------- | ------------------------------------- |
| onChange         | `event.target.checked`读取boolean，`onChange={(event) => setChecked(event.target.checked)}` | 用户改变选中状态；不因宿主改props触发 |
| onFocus / onBlur | `CheckboxProps['onFocus']` / `CheckboxProps['onBlur']`原生输入焦点事件                      | 实际输入获得/失去焦点                 |

### 实例方法

使用`useRef<CheckboxRef>(null)`并传`ref`；挂载后可调用，卸载后为null。

| 成员            | 用法                                          | 边界                                             |
| --------------- | --------------------------------------------- | ------------------------------------------------ |
| focus(options?) | `ref.current?.focus({ preventScroll: true })` | 聚焦原生输入；禁用时不能正常聚焦                 |
| blur()          | `ref.current?.blur()`                         | 移除原生输入焦点                                 |
| input           | `ref.current?.input`                          | 原生HTMLInputElement或null，避免通过它绕过受控值 |
| nativeElement   | `ref.current?.nativeElement`                  | 公开展示根，可能为null；不依赖内部子节点         |

FormItem 收集布尔值必须设置 `valuePropName="checked"`；只修改 value 不能控制复选框。校验通过 FormItem rules，加载/错误由宿主提供。没有 size 属性，尺寸与间距由主题密度控制；Tab聚焦、Space切换遵循原生行为。不增加标签包装层的第二重焦点环，reduced motion遵循主题基线。大量选项建议可搜索列表，避免无限渲染。

示例提供主题设置；静态类型检查不能替代明暗、窄屏和键盘真实浏览器验收。
