import { useId, useState } from 'react';
import { FormItem, Input, Switch } from 'lx-ui';
import { Form } from 'lx-ui/antd';
import { DataDisplayDemoFrame } from './data-display-demo-frame';

export default function Demo() {
  const id = useId();
  const [disabled, setDisabled] = useState(false);
  return (
    <DataDisplayDemoFrame>
      <label>
        禁止编辑的审批阶段{' '}
        <Switch aria-label="禁止编辑的审批阶段" checked={disabled} onChange={setDisabled} />
      </label>
      <Form
        name={id}
        initialValues={{ remark: '待核对', code: 'A-', confirmed: '客户资料完整' }}
        layout="vertical"
        disabled={disabled}
        size="small"
      >
        <FormItem
          name="remark"
          label="审批备注"
          validateStatus="warning"
          help="备注较短，请确认信息完整"
        >
          <Input />
        </FormItem>
        <FormItem
          name="code"
          label="登记编码"
          validateStatus="error"
          help="编码格式不正确，请检查后更正"
        >
          <Input aria-invalid="true" />
        </FormItem>
        <FormItem name="confirmed" label="已确认字段" validateStatus="success" hasFeedback>
          <Input />
        </FormItem>
      </Form>
    </DataDisplayDemoFrame>
  );
}
