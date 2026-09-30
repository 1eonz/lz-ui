import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Result } from '..';
import { describe, expect, it } from 'vitest';

describe('Result', () => {
  it('renders semantic title and action', () => {
    render(<Result status="error" title="失败" extra={<button>重试</button>} />);
    expect(screen.getByText('失败')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '重试' })).toBeInTheDocument();
  });
  it('preserves error status semantics and stable ref', () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<Result ref={ref} status="error" title="提交失败" />);
    expect(ref.current).toBeTruthy();
    expect(container.querySelector('.ant-result-error')).toBeInTheDocument();
  });
  it('forwards className to the AntD root', () => {
    const { container } = render(<Result className="custom-result" status="info" title="提示" />);
    expect(container.querySelector('.ant-result')).toHaveClass('custom-result');
  });
});
