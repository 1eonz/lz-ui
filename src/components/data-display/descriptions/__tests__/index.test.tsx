import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Descriptions } from '..';
import { describe, expect, it } from 'vitest';

describe('Descriptions', () => {
  it('renders item label and value', () => {
    render(<Descriptions items={[{ key: 'a', label: '名称', children: '杭州云栖科技' }]} />);
    expect(screen.getByText('杭州云栖科技')).toBeInTheDocument();
  });
  it('keeps label semantics and stable ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Descriptions ref={ref} items={[{ key: 'a', label: '名称', children: '杭州云栖科技' }]} />,
    );
    expect(ref.current).toBeTruthy();
    expect(screen.getByText('名称')).toBeInTheDocument();
  });
  it('forwards className to the AntD root', () => {
    const { container } = render(
      <Descriptions
        className="custom-descriptions"
        items={[{ key: 'a', label: '名称', children: '值' }]}
      />,
    );
    expect(container.querySelector('.ant-descriptions')).toHaveClass('custom-descriptions');
  });
  it('preserves host semantic label and content overrides', () => {
    render(
      <Descriptions
        items={[{ key: 'x', label: '标签', children: '数值' }]}
        styles={{ label: { padding: 3, fontWeight: 400 }, content: { padding: 5 } }}
      />,
    );
    expect(screen.getByText('标签')).toHaveStyle({ padding: '3px', fontWeight: 400 });
    expect(screen.getByText('数值')).toHaveStyle({ padding: '5px' });
  });
});
