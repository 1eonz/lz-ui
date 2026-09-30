import { useState } from 'react';
import { Button, Upload } from 'lx-ui';
import type { UploadProps } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';

export default function Demo() {
  const [files, setFiles] = useState<NonNullable<UploadProps['fileList']>>([]);
  return (
    <DataDisplayDemoFrame>
      <Upload
        multiple
        fileList={files}
        onChange={({ fileList }) => setFiles(fileList)}
        onRemove={(file) => {
          setFiles((current) => current.filter((item) => item.uid !== file.uid));
          return true;
        }}
      >
        <Button>添加本地附件</Button>
      </Upload>
      <Button disabled={files.length === 0} onClick={() => setFiles([])}>
        清空附件
      </Button>
      <p role="status">已选择 {files.length} 个文件，仅保存在当前页面。</p>
    </DataDisplayDemoFrame>
  );
}
