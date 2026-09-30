import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../index';
import type { ButtonRef } from '../index';

describe('Button', () => {
  it('defaults to a non-submitting button and forwards its ref', () => {
    const ref = createRef<ButtonRef>();
    render(<Button ref={ref}>保存</Button>);
    expect(screen.getByRole('button', { name: '保存' })).toHaveAttribute('type', 'button');
    expect(ref.current).toBe(screen.getByRole('button'));
  });

  it('blocks disabled and loading actions', () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <Button disabled onClick={onClick}>
        保存
      </Button>,
    );
    fireEvent.click(screen.getByRole('button'));
    rerender(
      <Button loading onClick={onClick}>
        保存
      </Button>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });
});
