import { render, screen } from '@testing-library/react';
import { Space } from '../index';

describe('Space', () => {
  it('uses token gaps and wraps without child margins', () => {
    render(
      <Space size={['small', 'large']} wrap>
        <span>甲</span>
        <span>乙</span>
      </Space>,
    );
    const root = screen.getByText('甲').parentElement;
    expect(root).toHaveStyle({
      columnGap: 'var(--lx-space-sm)',
      rowGap: 'var(--lx-space-xl)',
      flexWrap: 'wrap',
    });
  });

  it('inserts a visual split only between children', () => {
    const { container } = render(
      <Space split="|">
        甲<span>乙</span>
        <span>丙</span>
      </Space>,
    );
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2);
  });

  it('keeps a wrapped separator with the following child', () => {
    const { container } = render(
      <Space split="|" wrap>
        <span>甲</span>
        <span>乙</span>
      </Space>,
    );
    const group = container.querySelector('[class*="splitGroup"]');
    expect(group).toBeInTheDocument();
    expect(group?.textContent).toBe('|乙');
    expect(group).toHaveStyle({ columnGap: 'var(--lx-space-sm)' });
  });

  it('keeps wrapped vertical separators stacked with the following child', () => {
    const { container } = render(
      <Space direction="vertical" size="large" split="|" wrap>
        <span>甲</span>
        <span>乙</span>
      </Space>,
    );
    const group = container.querySelector('[class*="splitGroup"]');
    expect(group).toHaveStyle({ flexDirection: 'column', rowGap: 'var(--lx-space-xl)' });
  });
});
