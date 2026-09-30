import { useState } from 'react';
import { Button, Upload } from 'lx-ui';
import { Upload as AntUpload } from 'lx-ui/antd';
import { DataDisplayDemoFrame } from './data-display-demo-frame';

export default function Demo() {
  const [message, setMessage] = useState('仅接受小于2MB的PDF');
  return (
    <DataDisplayDemoFrame>
      <Upload
        accept=".pdf"
        maxCount={2}
        beforeUpload={(file) => {
          // accept 仅过滤文件选择器，真实限制仍在beforeUpload验证；不启用网络请求。
          if (!file.name.toLowerCase().endsWith('.pdf') || file.size >= 2 * 1024 * 1024) {
            setMessage(`${file.name} 不符合PDF或大小要求`);
            return AntUpload.LIST_IGNORE;
          }
          setMessage(`${file.name} 已保留在本地，可使用列表移除`);
          return false;
        }}
      >
        <Button>选择PDF附件</Button>
      </Upload>
      <p role="status">{message}</p>
    </DataDisplayDemoFrame>
  );
}
