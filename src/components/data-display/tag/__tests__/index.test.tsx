import { fireEvent, render, screen } from '@testing-library/react';
import { Tag } from '..';
import { describe, expect, it, vi } from 'vitest';
describe('Tag', () =>
  it('supports close', () => {
    const fn = vi.fn();
    render(
      <Tag closable onClose={fn}>
        客户
      </Tag>,
    );
    const close = screen.getByRole('img');
    fireEvent.keyDown(close, { key: 'Enter' });
    fireEvent.click(close);
    expect(fn).toHaveBeenCalled();
  }));
