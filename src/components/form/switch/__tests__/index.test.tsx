import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Switch } from '../index';
import type { SwitchRef } from '../index';

describe('Switch', () => {
  it('forwards controlled changes, id, and focus ref', () => {
    const onChange = vi.fn();
    const ref = createRef<SwitchRef>();
    render(<Switch id="enabled" checked={false} onChange={onChange} ref={ref} />);
    const control = screen.getByRole('switch');
    expect(control).toHaveAttribute('id', 'enabled');
    expect(control).toHaveAttribute('aria-checked', 'false');
    ref.current?.focus();
    expect(control).toHaveFocus();
    fireEvent.click(control);
    expect(onChange).toHaveBeenCalledWith(true, expect.anything());
    expect(control).toHaveAttribute('aria-checked', 'false');
  });

  it('supports uncontrolled, loading, and disabled states', () => {
    const { rerender } = render(<Switch defaultChecked />);
    const control = screen.getByRole('switch');
    expect(control).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(control);
    expect(control).toHaveAttribute('aria-checked', 'false');
    rerender(<Switch loading />);
    expect(control).toBeDisabled();
    rerender(<Switch disabled />);
    expect(control).toBeDisabled();
  });
});
