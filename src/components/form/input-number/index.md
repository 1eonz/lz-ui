---
title: InputNumber 数值输入
group: Form
demo:
  defaultShowCode: false
---

# InputNumber 数值输入

用于数量、金额或比率输入，保留 AntD 的解析与键盘步进。高精度数值通过stringMode保留字符串，领域校验由宿主负责。

## 最小使用

```tsx pure
import { InputNumber, LxConfigProvider } from 'lx-ui';
import 'lx-ui/style.css';

export default function Demo() {
  return (
    <LxConfigProvider theme={{ persist: false }}>
      <label>
        数量 <InputNumber aria-label="数量" min={0} defaultValue={1} />
      </label>
    </LxConfigProvider>
  );
}
```

## 示例

### 尺寸与禁用

<code src="../../../../docs/demos/form-doc-number-basic.tsx" title="数量输入"></code>

### 受控精度与状态

stringMode返回字符串，清空返回null；错误status只是视觉标记，不代替校验。

<code src="../../../../docs/demos/form-doc-number-precision.tsx" title="高精度数值"></code>

## API

`InputNumberProps`保持AntD >=5.24 <6公开属性。

| 属性                 | 类型                           | 默认                 | 说明                               |
| -------------------- | ------------------------------ | -------------------- | ---------------------------------- |
| value / defaultValue | InputNumberProps['value']      | —                    | 受控值 / 非受控初值                |
| min / max            | number \| string               | -Infinity / Infinity | 允许范围；业务提交仍需校验         |
| step                 | number \| string               | 1                    | 步长；高精度可传字符串             |
| precision            | number                         | 从数值/formatter决定 | 小数精度                           |
| stringMode           | boolean                        | false                | 高精度字符串值与onChange返回       |
| formatter            | InputNumberProps['formatter']  | —                    | 视觉格式化，保留输入中状态         |
| parser               | InputNumberProps['parser']     | —                    | 从格式化文本提取值                 |
| disabled / readOnly  | boolean                        | false                | 禁用 / 原生只读                    |
| status               | 'error' \| 'warning'           | —                    | 状态样式                           |
| size                 | 'small' \| 'middle' \| 'large' | 主题默认             | 显式尺寸                           |
| onChange             | InputNumberProps['onChange']   | —                    | number/string/null，用户值变化触发 |
| onStep               | InputNumberProps['onStep']     | —                    | 步进值及offset/type信息            |

ref `InputNumberRef`提供focus/blur和nativeElement；focus可接公开options（包括preventScroll、cursor）。挂载后使用，卸载后current=null。onBlur中的原生event.target.value是输入文本，格式化时不一定等于业务值，业务保存使用onChange值。受控值超界不应期待控件自动改写宿主状态。

## 表单、主题与边界

### 事件参数

| 事件     | 参数与示例                                                 | 触发时机                                         |
| -------- | ---------------------------------------------------------- | ------------------------------------------------ |
| onChange | number/string/null，`onChange={(next) => setAmount(next)}` | 用户数值变化；stringMode返回字符串，清空null     |
| onStep   | `(value,{offset,type})`，type为up/down                     | 用户按钮或键盘步进；不是全部输入变化             |
| onBlur   | 原生焦点事件                                               | 输入失焦；target.value为文本，保存应取onChange值 |

### 实例方法

`useRef<InputNumberRef>(null)`，ref兼容原生输入并增强focus。

| 成员            | 用法                                                         | 边界                                            |
| --------------- | ------------------------------------------------------------ | ----------------------------------------------- |
| focus(options?) | `ref.current?.focus({ cursor: 'all', preventScroll: true })` | 公开InputFocusOptions，可选cursor start/end/all |
| blur()          | `ref.current?.blur()`                                        | 移除焦点，不模拟onChange                        |
| nativeElement   | `ref.current?.nativeElement`                                 | 公开展示根HTMLElement；非业务数值来源           |
| 原生输入成员    | `ref.current?.value`                                         | 仅DOM文本，不代替stringMode业务值               |

FormItem name注入value/onChange/id，rules校验业务范围。Tab进入，方向键步进；label或aria-label提供名称。显式尺寸优先主题默认，密度/明暗/焦点来自Provider，reduced motion遵循基线。组件没有异步加载、empty或请求恢复；不要在formatter/parser内发起请求。高精度字符串在服务端序列化前保留，避免Number转换损失。浏览器视觉验收另行记录。
