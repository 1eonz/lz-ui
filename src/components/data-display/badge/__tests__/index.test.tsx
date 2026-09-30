import { render, screen } from '@testing-library/react';
import { Badge } from '..';
import { describe, expect, it } from 'vitest';
describe('Badge', () => {
  it('shows overflow count', () => {
    render(<Badge count={120} overflowCount={99} />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });
  it('preserves status, dot, title, and child accessibility semantics', () => {
    const { rerender } = render(
      <Badge status="success" title="已完成">
        <button>订单</button>
      </Badge>,
    );
    expect(screen.getByRole('button', { name: '订单' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '订单' })).toBeInTheDocument();
    rerender(<Badge dot data-testid="dot" />);
    expect(screen.getByTestId('dot')).toBeInTheDocument();
    expect(screen.getByTestId('dot')).toBeInTheDocument();
  });
});
