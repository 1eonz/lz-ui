# FormItem

Label and validation boundary for a single control inside AntD `Form`. It accepts all public `FormItemProps`, including `name`, `label`, `rules`, `help`, `extra`, `required`, `validateStatus` and `hasFeedback`. The direct child must forward `value`, `onChange` and `id`; the lx Input, Select, InputNumber and DatePicker do so. Use `label` for an accessible name and `help` for actionable error text. AntD owns controlled form values, error messages and keyboard order. The theme controls spacing across density/mode. This wrapper has no independent loading or async lifecycle; fields may show those through their own public APIs.

```tsx pure
<Form onFinish={save}>
  <FormItem name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
    <Input />
  </FormItem>
</Form>
```
