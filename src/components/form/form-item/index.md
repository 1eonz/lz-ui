---
title: FormItem 表单项
group: Form
demo:
  defaultShowCode: false
---

# FormItem 表单项

单个控件的标签、说明和校验边界。必须位于`lx-ui/antd`的Form上下文，字段注册、存储和校验由AntD负责。

## 最小使用

```tsx pure
import { Button, FormItem, Input, LxConfigProvider } from 'lx-ui';
import { Form } from 'lx-ui/antd';
import 'lx-ui/style.css';

export default function Demo() {
  return (
    <LxConfigProvider theme={{ persist: false }}>
      <Form layout="vertical">
        <FormItem
          name="name"
          label="客户名称"
          rules={[{ required: true, message: '请输入客户名称' }]}
        >
          <Input />
        </FormItem>
        <Button htmlType="submit">校验</Button>
      </Form>
    </LxConfigProvider>
  );
}
```

## 示例

### 标签、规则与提交

提交触发真实required校验，成功后显示保存结果；不是点击即模拟成功。

<code src="../../../../docs/demos/form-doc-item-basic.tsx" title="字段校验"></code>

### Checkbox绑定与自定义规则

valuePropName="checked"使Form管理布尔值；未确认授权时真实validator阻止提交。

<code src="../../../../docs/demos/form-doc-item-checkbox.tsx" title="布尔字段"></code>

### 状态、禁用和尺寸

手动validateStatus与help用于已知业务状态；切换审批阶段会通过Form公开disabled禁用控件。

<code src="../../../../docs/demos/form-doc-item-states.tsx" title="校验状态"></code>

## API

`FormItemProps`保留AntD >=5.24 <6公开属性。

| 属性                      | 类型                                              | 默认        | 说明                                   |
| ------------------------- | ------------------------------------------------- | ----------- | -------------------------------------- |
| name                      | FormItemProps['name']                             | —           | 字符串、数字或嵌套路径，注册字段       |
| label                     | ReactNode                                         | —           | 可见标签并关联控件id                   |
| rules                     | FormItemProps['rules']                            | —           | required、pattern、validator等公开规则 |
| initialValue              | FormItemProps['initialValue']                     | —           | 字段初值；Form.initialValues优先       |
| valuePropName             | string                                            | value       | Checkbox/Switch设为checked             |
| trigger / validateTrigger | string / string或string[]                         | onChange    | 值收集事件 / 校验事件                  |
| required                  | boolean                                           | 从rules推导 | 必填标记，本身不代替校验规则           |
| help / extra              | ReactNode                                         | —           | 校验反馈 / 常驻补充说明                |
| validateStatus            | 'success' \| 'warning' \| 'error' \| 'validating' | 自动推导    | 显式视觉状态                           |
| hasFeedback               | FormItemProps['hasFeedback']                      | false       | 校验图标配置                           |
| preserve                  | boolean                                           | true        | 卸载字段仍保留值                       |
| dependencies              | FormItemProps['dependencies']                     | —           | 依赖字段变化触发更新/校验              |
| noStyle / hidden          | boolean                                           | false       | 不绘制布局 / 隐藏但仍参与收集校验      |

FormItem无新增ref或保存事件。使用Form公开onFinish/onFinishFailed、onValuesChange以及Form.useForm实例；程序化setFieldsValue不模拟用户onValuesChange。受控字段不要同时在子控件传defaultValue，初值放Form.initialValues。动态初值使用Form公开setFieldsValue/resetFields，而非期待initialValues每次更新。

## 控件转发、主题与键盘

### 事件与实例方法

FormItem无独立保存事件/ref。以下通过`Form`的公开Props和`Form.useForm()`实例使用，不是FormItem方法。

| 成员                        | 参数/用法                                         | 时机与边界                                     |
| --------------------------- | ------------------------------------------------- | ---------------------------------------------- |
| Form.onFinish               | `(values)`；`onFinish={(values) => save(values)}` | 全部校验成功；宿主负责异步保存和重复提交锁     |
| Form.onFinishFailed         | `({values,errorFields,outOfDate})`                | 提交校验失败，给出字段恢复路径                 |
| Form.onValuesChange         | `(changedValues,allValues)`                       | 用户编辑；setFieldsValue不模拟触发             |
| form.validateFields()       | `await form.validateFields()`                     | 成功返回值，失败reject校验信息；不发请求       |
| form.submit()               | `form.submit()`                                   | 触发与原生提交相同校验/回调流程                |
| form.resetFields()          | `form.resetFields()`                              | 恢复初值，会按AntD规则重建字段子树             |
| form.setFieldsValue(values) | `form.setFieldsValue({name:'客户'})`              | 程序化存储更新，不触发用户onValuesChange       |
| form.getFieldsValue()       | `form.getFieldsValue(true)`                       | true读完整存储，包含保留值；提交权限由宿主决定 |

直接子控件必须转发value（或checked）、onChange和id；自定义包装不能吞掉这些属性。多个控件需要分别注册，不能把普通div当成可自动收集子树。FormItem不修复自定义组件，不管理异步请求或提交锁。

标签、错误和extra保持相邻；rules失败应说明恢复动作，Tab顺序来自实际控件。尺寸由Form与控件，间距/明暗/密度来自Provider；reduced motion遵循基线。复杂validator需处理取消与乱序；昂贵依赖更新应缩小范围。真实视觉与键盘验证另行记录。
