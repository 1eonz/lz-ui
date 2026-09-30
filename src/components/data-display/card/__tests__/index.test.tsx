import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Card } from '..';
import { describe, expect, it } from 'vitest';

describe('Card', () => {
  it('renders loading state', () => {
    render(<Card loading title="客户" />);
    expect(screen.getByText('客户')).toBeInTheDocument();
  });
  it('exposes stable root and renders extra/actions slots', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Card
        ref={ref}
        title="客户"
        extra={<button>编辑</button>}
        actions={[<span key="a">查看</span>]}
      />,
    );
    expect(ref.current).toBe(screen.getByText('客户').closest('.ant-card'));
    expect(screen.getByRole('button', { name: '编辑' })).toBeInTheDocument();
    expect(screen.getByText('查看')).toBeInTheDocument();
  });
  it('forwards className to the AntD root', () => {
    const { container } = render(<Card className="custom-card" title="客户" />);
    expect(container.querySelector('.ant-card')).toHaveClass('custom-card');
  });

  it('keeps host root and semantic overrides on the actual card', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Card
        ref={ref}
        style={{ order: 2, borderRadius: 2 }}
        styles={{ body: { padding: 7 } }}
        classNames={{ body: 'host-card-body' }}
      >
        正文
      </Card>,
    );
    expect(ref.current).toHaveStyle({ order: 2, borderRadius: '2px' });
    expect(screen.getByText('正文')).toHaveClass('host-card-body');
    expect(screen.getByText('正文')).toHaveStyle({ padding: '7px' });
  });
});
