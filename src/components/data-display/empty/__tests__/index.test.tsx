import { render, screen } from '@testing-library/react';
import { Button } from '../../../general/button';
import { Empty } from '../index';

describe('Empty', () => {
  it('renders description and the explicit action', () => {
    render(<Empty description="暂无记录" action={<Button>新建</Button>} />);
    expect(screen.getByText('暂无记录')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '新建' })).toBeInTheDocument();
  });

  it('supports compact variant and custom image', () => {
    const { container } = render(<Empty variant="small" image={<span>图示</span>} />);
    expect(container.querySelector('[data-lx-empty-variant="small"]')).toBeTruthy();
    expect(screen.getByText('图示')).toBeInTheDocument();
  });
});
