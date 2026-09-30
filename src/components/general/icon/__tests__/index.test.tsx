import { render, screen } from '@testing-library/react';
import { SearchOutlined } from '@ant-design/icons';
import type { SVGProps } from 'react';
import { Icon } from '../index';

const TestGlyph = (props: SVGProps<SVGSVGElement>) => <svg data-testid="glyph" {...props} />;

describe('Icon', () => {
  it('hides decorative SVG and labels meaningful icons', () => {
    const { rerender } = render(<Icon component={TestGlyph} />);
    expect(screen.getByTestId('glyph').parentElement).toHaveAttribute('aria-hidden', 'true');
    rerender(<Icon component={TestGlyph} label="搜索" />);
    expect(screen.getByRole('img', { name: '搜索' })).toBeInTheDocument();
    expect(screen.getByTestId('glyph')).toHaveAttribute('aria-hidden', 'true');
  });

  it('keeps size and rotation local to the icon', () => {
    render(<Icon component={TestGlyph} size={20} rotate={90} spin />);
    expect(screen.getByTestId('glyph').parentElement).toHaveStyle({ fontSize: '20px' });
    expect(screen.getByTestId('glyph')).toHaveStyle({ transform: 'rotate(90deg)' });
  });

  it('accepts an individually imported AntD icon', () => {
    render(<Icon component={SearchOutlined} label="搜索" />);
    expect(screen.getByRole('img', { name: '搜索' })).toBeInTheDocument();
  });
});
