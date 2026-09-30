---
title: Switch 开关
group: Form
demo:
  defaultShowCode: false
---

# Switch 开关

用于立即生效的布尔设置；需要提交后生效的勾选用 Checkbox。异步保存和失败回退由宿主负责。

## 最小使用

```tsx pure
import { LxConfigProvider, Switch } from 'lx-ui';
import 'lx-ui/style.css';

export default function Demo() {
  return (
    <LxConfigProvider theme={{ persist: false }}>
      <label>
        邮件通知 <Switch aria-label="邮件通知" defaultChecked />
      </label>
    </LxConfigProvider>
  );
}
```

## 示例

### 尺寸、禁用与加载

<code src="../../../../docs/demos/form-doc-switch-basic.tsx" title="基础状态"></code>

### 受控保存与失败恢复

本地600ms保存模拟首次失败、再次成功；失败保留原值，loading阻止重复操作，卸载清理timer。

<code src="../../../../docs/demos/form-doc-switch-controlled.tsx" title="受控恢复"></code>

## API

`SwitchProps` 保留 AntD >=5.24 <6公开属性。

| 属性                                | 类型                            | 默认    | 说明                        |
| ----------------------------------- | ------------------------------- | ------- | --------------------------- |
| checked / defaultChecked            | boolean                         | false   | 受控 / 非受控初值           |
| disabled                            | boolean                         | false   | 禁止切换                    |
| loading                             | boolean                         | false   | 加载图形并禁止用户切换      |
| size                                | 'default' \| 'small'            | default | 显式尺寸优先于主题默认      |
| checkedChildren / unCheckedChildren | ReactNode                       | —       | 开/关状态文字               |
| onChange                            | SwitchProps['onChange']         | —       | 用户切换时传(checked,event) |
| onClick                             | SwitchProps['onClick']          | —       | 用户点击时传(checked,event) |
| id / className / style              | string / string / CSSProperties | —       | 原生关联及公开样式          |

受控 checked 更新不触发用户回调。`SwitchRef` 为原生HTMLButtonElement，挂载后可以focus/blur；不是包含nativeElement的实例对象。FormItem 使用valuePropName="checked"；规则校验不由Switch执行。

## 主题、键盘与边界

### 事件参数

| 事件     | 参数与示例                                                 | 触发时机                                   |
| -------- | ---------------------------------------------------------- | ------------------------------------------ |
| onChange | `(checked,event)`；`onChange={(next) => setChecked(next)}` | 用户切换开关，checked是下一boolean状态     |
| onClick  | `(checked,event)`；可读取event.currentTarget               | 用户点击；不应在此重复同一onChange保存请求 |

### 实例方法

`useRef<SwitchRef>(null)`获得HTMLButtonElement；没有包装实例的nativeElement字段。

| 成员            | 用法                                          | 边界                                         |
| --------------- | --------------------------------------------- | -------------------------------------------- |
| focus(options?) | `ref.current?.focus({ preventScroll: true })` | 原生按钮聚焦；禁用/加载时不保证可聚焦        |
| blur()          | `ref.current?.blur()`                         | 移除按钮焦点，不改变checked                  |
| 原生DOM成员     | `ref.current?.getBoundingClientRect()`        | 挂载后读取；不要直接修改受控状态或私有子节点 |

提供可见label和可访问名称，Tab聚焦，Space/Enter激活。主题控制颜色、密度与焦点，reduced motion遵循主题基线。组件不保存数据、不自动回滚、不创建empty/error状态。大列表应虚拟化并由宿主限制并发请求。实际明暗、密度、焦点与动效需要浏览器验收。
