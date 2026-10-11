import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Result } from '..';
import { describe, expect, it } from 'vitest';
import styles from '../index.module.css';

describe('Result', () => {
  it('renders semantic title and action', () => {
    render(<Result status="error" title="失败" extra={<button>重试</button>} />);
    expect(screen.getByText('失败')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '重试' })).toBeInTheDocument();
  });
  it('forwards ref to the outer element for an error result', () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<Result ref={ref} status="error" title="提交失败" />);
    expect(ref.current).toBe(container.firstElementChild);
    expect(screen.getByText('提交失败')).toBeInTheDocument();
  });
  it('forwards className to the outer element', () => {
    const { container } = render(<Result className="custom-result" status="info" title="提示" />);
    expect(container.firstElementChild).toHaveClass('custom-result');
  });
  it('preserves public prefixCls and host style overrides', () => {
    const { container } = render(
      <Result
        prefixCls="custom-result"
        status="404"
        title="记录不存在"
        style={{ marginTop: 12, paddingInline: 8 }}
      />,
    );
    const result = container.querySelector('.custom-result');
    if (!result) throw new Error('Result 未应用自定义 prefixCls');
    expect(result).toHaveClass('custom-result');
    expect(result).toHaveTextContent('记录不存在');
    expect(result).toHaveStyle({ marginTop: '12px', paddingInline: '8px' });
  });

  it('places the default exception illustration inside its own responsive boundary', () => {
    render(<Result status="403" title="暂无访问权限" />);

    expect(
      screen.getByTitle('Unauthorized').closest(`.${styles.exceptionIllustration}`),
    ).toBeInTheDocument();
  });

  it('renders a custom icon for an exception status through the public icon prop', () => {
    render(<Result status={403} icon={<span data-testid="custom-result-icon">自定义图标</span>} />);

    expect(screen.getByTestId('custom-result-icon')).toBeInTheDocument();
    expect(screen.queryByTitle('Unauthorized')).not.toBeInTheDocument();
  });
});
