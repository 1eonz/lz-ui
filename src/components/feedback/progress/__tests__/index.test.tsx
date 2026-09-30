import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Progress } from '..';
import type { ProgressRef } from '..';

describe('Progress', () => {
  it('supports percent, status and accessible naming', () => {
    render(<Progress percent={42} status="active" aria-label="导入进度" />);
    expect(screen.getByLabelText('导入进度')).toBeInTheDocument();
    expect(screen.getByText('42%')).toBeInTheDocument();
  });
  it('uses the host formatter and supports boundary values', () => {
    render(<Progress percent={120} format={(value) => `完成 ${value}`} />);
    expect(screen.getByText('完成 100')).toBeInTheDocument();
  });
  it('forwards className and ref to the AntD root', () => {
    const ref = createRef<ProgressRef>();
    const { unmount } = render(<Progress ref={ref} className="custom-progress" percent={10} />);
    expect(ref.current).toHaveClass('custom-progress');
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(screen.getByRole('progressbar'));
    unmount();
    expect(ref.current).toBeNull();
  });
  it.each([
    [-10, 0],
    [120, 100],
    [NaN, 0],
    [Infinity, 0],
    [-Infinity, 0],
    [62.5, 62.5],
  ])('normalizes percent %s consistently to %s', (percent, expected) => {
    const format = vi.fn((value) => <strong>总进度 {value}</strong>);
    render(<Progress percent={percent} format={format} aria-label="总进度" />);
    expect(screen.getByRole('progressbar', { name: '总进度' })).toHaveAttribute(
      'aria-valuenow',
      String(expected),
    );
    expect(screen.getByText(`总进度 ${expected}`)).toBeInTheDocument();
    expect(format).toHaveBeenLastCalledWith(expected, 0);
  });
  it.each(['line', 'circle', 'dashboard'] as const)(
    'keeps the total for %s with a success segment',
    (type) => {
      const format = vi.fn((total, completed) => `${total} / ${completed}`);
      render(<Progress type={type} percent={80} success={{ percent: 30 }} format={format} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '80');
      expect(screen.getByText('80 / 30')).toBeInTheDocument();
    },
  );
  it.each([
    [-10, 0],
    [120, 100],
    [NaN, 0],
    [Infinity, 0],
  ])('normalizes all success APIs %s to %s', (segment, expected) => {
    const format = vi.fn((total, completed) => `${total} / ${completed}`);
    const { rerender } = render(
      <Progress percent={80} success={{ percent: segment }} format={format} />,
    );
    expect(screen.getByText(`80 / ${expected}`)).toBeInTheDocument();
    rerender(<Progress percent={80} successPercent={segment} format={format} />);
    expect(screen.getByText(`80 / ${expected}`)).toBeInTheDocument();
    rerender(<Progress percent={80} success={{ progress: segment }} format={format} />);
    expect(screen.getByText(`80 / ${expected}`)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '80');
  });
  it('preserves fractional totals with steps and no visible info', () => {
    render(<Progress percent={62.5} steps={8} showInfo={false} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '62.5');
  });
});
