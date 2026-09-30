import { useState } from 'react';
import '../../src/style.css';
import { Button, LxConfigProvider, Upload } from 'lx-ui';

export default function UploadDemo() {
  const [fileCount, setFileCount] = useState(0);
  return (
    <LxConfigProvider>
      <Upload
        multiple
        accept=".pdf,.doc,.docx"
        beforeUpload={() => false}
        onChange={({ fileList }) => setFileCount(fileList.length)}
      >
        <Button>选择本地文件</Button>
      </Upload>
      <p role="status">{fileCount ? `已选择 ${fileCount} 个文件，尚未上传` : '未选择文件'}</p>
    </LxConfigProvider>
  );
}
