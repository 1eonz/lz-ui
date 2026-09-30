import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InputNumber } from '../index';

describe('InputNumber', () => {
  it('emits numeric changes and respects disabled', () => {
    const onChange = vi.fn();
    const { rerender } = render(<InputNumber aria-label="数量" onChange={onChange} />);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '3' } });
    expect(onChange).toHaveBeenCalledWith(3);
    rerender(<InputNumber aria-label="数量" disabled />);
    expect(screen.getByRole('spinbutton')).toBeDisabled();
  });
});
