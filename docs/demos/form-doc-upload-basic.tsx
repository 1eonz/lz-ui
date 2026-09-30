import { Button, Upload } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';

export default function Demo() {
  return (
    <DataDisplayDemoFrame>
      <Upload multiple>
        <Button>选择本地附件</Button>
      </Upload>
      <Upload disabled>
        <Button disabled>附件选择已禁用</Button>
      </Upload>
    </DataDisplayDemoFrame>
  );
}
