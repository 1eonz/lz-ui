import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { List } from '..';
import { describe, expect, it } from 'vitest';
describe('List', () => {
  it('renders keyed data', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <List
        ref={ref}
        dataSource={[{ id: 1, name: 'A' }]}
        rowKey="id"
        renderItem={(item) => <List.Item>{item.name}</List.Item>}
      />,
    );
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(ref.current).toBeTruthy();
    expect(ref.current?.firstElementChild).toHaveClass('ant-list');
  });
  it('forwards className to the AntD root', () => {
    const { container } = render(<List className="custom-list" dataSource={[]} />);
    expect(container.querySelector('.ant-list')).toHaveClass('custom-list');
  });
});
