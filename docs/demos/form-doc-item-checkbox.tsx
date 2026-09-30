import { useId, useState } from 'react';
import { Button, Checkbox, FormItem } from 'lx-ui';
import { Form } from 'lx-ui/antd';
import { DataDisplayDemoFrame } from './data-display-demo-frame';

export default function Demo() {
  const id = useId();
  const [saved, setSaved] = useState(false);
  return (
    <DataDisplayDemoFrame>
      <Form name={id} initialValues={{ consent: false }} onFinish={() => setSaved(true)}>
        <FormItem
          name="consent"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value: boolean) =>
                value ? Promise.resolve() : Promise.reject(new Error('请确认已核对客户授权')),
            },
          ]}
        >
          <Checkbox>已核对客户授权</Checkbox>
        </FormItem>
        <Button htmlType="submit">提交授权</Button>
      </Form>
      <p role="status">{saved ? '授权已提交' : '授权未提交'}</p>
    </DataDisplayDemoFrame>
  );
}
