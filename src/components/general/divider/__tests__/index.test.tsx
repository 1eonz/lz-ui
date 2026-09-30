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

  it('preserves an external label relationship instead of generating an internal name', () => {
    const { container } = render(
      <>
        <span id="external-divider-name">合同审查记录</span>
        <Divider aria-labelledby="external-divider-name">客户资料</Divider>
      </>,
    );
    const separator = screen.getByRole('separator', { name: '合同审查记录' });
    expect(separator).toHaveAttribute('aria-labelledby', 'external-divider-name');
    expect(container.querySelector('[id^="lx-divider-"]')).not.toBeInTheDocument();
  });

  it('keeps an explicit aria-label without adding an internal label relationship', () => {
    const { container } = render(<Divider aria-label="客户自定义分组">可见资料</Divider>);
    const separator = screen.getByRole('separator', { name: '客户自定义分组' });
    expect(separator).not.toHaveAttribute('aria-labelledby');
    expect(container.querySelector('[id^="lx-divider-"]')).not.toBeInTheDocument();
  });
});
