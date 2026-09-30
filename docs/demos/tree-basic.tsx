import { Tree } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';

export default function TreeBasicDemo() {
  return (
    <DataDisplayDemoFrame>
      <Tree
        aria-label="组织目录"
        defaultExpandedKeys={['hq']}
        treeData={[
          {
            key: 'hq',
            title: '集团总部',
            children: [
              { key: 'rd', title: '研发中心' },
              { key: 'finance', title: '财务共享中心' },
            ],
          },
        ]}
      />
    </DataDisplayDemoFrame>
  );
}
