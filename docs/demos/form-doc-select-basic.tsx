import { useId } from 'react';
import { Select, Space } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './form-doc.module.css';

const options = [
  { label: '华东', value: 'east' },
  { label: '华北', value: 'north' },
  { label: '西南', value: 'southwest', disabled: true },
];
const sizeLabels = { small: '小尺寸', middle: '默认尺寸', large: '大尺寸' };
export default function Demo() {
  const id = useId();
  return (
    <DataDisplayDemoFrame>
      {(['small', 'middle', 'large'] as const).map((size) => (
        <Space key={size} direction="vertical" align="flex-start">
          <label htmlFor={`${id}-${size}`}>{sizeLabels[size]}地区</label>
          <Select
            id={`${id}-${size}`}
            className={styles.control}
            size={size}
            defaultValue="east"
            options={options}
          />
        </Space>
      ))}
      <Select
        className={styles.control}
        aria-label="固定地区"
        disabled
        value="north"
        options={options}
      />
    </DataDisplayDemoFrame>
  );
}
