import { render, screen } from '@testing-library/react';
import { Skeleton } from '../index';

describe('Skeleton accessibility', () => {
  it('exposes a busy status while loading', () => {
    render(<Skeleton aria-label="数据加载中" />);
    expect(screen.getByRole('status', { name: '数据加载中' })).toHaveAttribute('aria-busy', 'true');
  });
});
