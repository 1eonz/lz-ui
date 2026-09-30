import { render, screen } from '@testing-library/react';
import { Divider } from '../index';

describe('Divider', () => {
  it('uses a native rule when empty', () => {
    const { container } = render(<Divider />);
    expect(container.querySelector('hr')).toBeInTheDocument();
  });

  it('provides explicit orientation for labelled and vertical variants', () => {
    const { rerender } = render(<Divider>客户资料</Divider>);
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'horizontal');
    expect(screen.getByRole('separator', { name: '客户资料' })).toBeInTheDocument();
    rerender(<Divider aria-label="自定义分隔">客户资料</Divider>);
    expect(screen.getByRole('separator', { name: '自定义分隔' })).toBeInTheDocument();
    rerender(<Divider type="vertical" />);
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
  });
});
