import { render, screen } from '@testing-library/react';
import { Skeleton } from '../index';

describe('Skeleton', () => {
  it('marks a loading region busy and preserves its label', () => {
    render(<Skeleton loading active aria-label="客户资料加载中" />);
    expect(screen.getByRole('status', { name: '客户资料加载中' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
  });

  it('renders children after loading completes', () => {
    render(
      <Skeleton loading={false}>
        <p>客户资料</p>
      </Skeleton>,
    );
    expect(screen.getByText('客户资料')).toBeInTheDocument();
  });
});
