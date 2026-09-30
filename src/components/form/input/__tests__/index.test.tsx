import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Input, TextArea } from '../index';
import type { InputRef } from '../index';

describe('Input', () => {
  it('forwards value changes and the focus ref', () => {
    const ref = createRef<InputRef>();
    const onChange = vi.fn();
    render(<Input aria-label="名称" ref={ref} value="A" onChange={onChange} />);
    expect(ref.current?.input).toBe(screen.getByRole('textbox', { name: '名称' }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'B' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('supports disabled and invalid states', () => {
    render(<Input aria-label="名称" disabled status="error" />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('forwards multiline input changes through the same public contract', () => {
    const onChange = vi.fn();
    render(<TextArea aria-label="备注" onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox', { name: '备注' }), {
      target: { value: '跟进记录' },
    });
    expect(onChange).toHaveBeenCalled();
  });
});
