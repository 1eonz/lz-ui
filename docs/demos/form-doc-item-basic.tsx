import { useId, useState } from 'react';
import { Button, FormItem, Input } from 'lx-ui';
import { Form } from 'lx-ui/antd';
import { DataDisplayDemoFrame } from './data-display-demo-frame';

export default function Demo() {
  const id = useId();
  const [saved, setSaved] = useState('');
  return (
    <DataDisplayDemoFrame>
      <Form
        name={id}
        layout="vertical"
        onFinish={(values: { name: string }) => setSaved(values.name)}
      >
        <FormItem
          name="name"
          label="客户名称"
          rules={[{ required: true, message: '请输入客户名称' }]}
          extra="使用客户登记全称"
        >
          <Input />
        </FormItem>
        <Button htmlType="submit" type="primary">
          保存客户
        </Button>
      </Form>
      <p role="status">{saved ? `已保存：${saved}` : '尚未保存'}</p>
    </DataDisplayDemoFrame>
  );
}
