import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Statistic } from '..';
import { describe, expect, it } from 'vitest';

describe('Statistic', () => {
  it('renders formatted value', () => {
    render(<Statistic title="收入" value={1234} precision={2} />);
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('.00')).toBeInTheDocument();
  });
  it('renders formatter, prefix, suffix, and stable ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Statistic ref={ref} value={45} formatter={() => '四十五'} prefix="¥" suffix="元" />);
    expect(ref.current).toBeTruthy();
    expect(screen.getByText('四十五')).toBeInTheDocument();
    expect(screen.getByText('¥')).toBeInTheDocument();
    expect(screen.getByText('元')).toBeInTheDocument();
  });
  it('forwards className to the AntD root', () => {
    const { container } = render(<Statistic className="custom-statistic" value={1} />);
    expect(container.querySelector('.ant-statistic')).toHaveClass('custom-statistic');
  });
});
