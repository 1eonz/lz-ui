import { useState } from 'react';
import { Checkbox } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';

export default function Demo() {
  const [selected, setSelected] = useState<string[]>(['客户']);
  const items = ['客户', '订单', '合同'];
  return (
    <DataDisplayDemoFrame>
      <Checkbox
        checked={selected.length === items.length}
        indeterminate={selected.length > 0 && selected.length < items.length}
        onChange={(event) => setSelected(event.target.checked ? items : [])}
      >
        全选导出内容
      </Checkbox>
      {items.map((item) => (
        <Checkbox
          key={item}
          checked={selected.includes(item)}
          onChange={(event) =>
            setSelected(
              event.target.checked
                ? [...selected, item]
                : selected.filter((value) => value !== item),
            )
          }
        >
          {item}
        </Checkbox>
      ))}
      <p role="status">已选择：{selected.join('、') || '无'}</p>
    </DataDisplayDemoFrame>
  );
}
