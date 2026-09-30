import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox } from '../index';
import type { CheckboxRef } from '../index';

describe('Checkbox', () => {
  it('forwards controlled changes, id, and focus ref', () => {
    const onChange = vi.fn();
    const ref = createRef<CheckboxRef>();
    render(
      <Checkbox id="notify" checked={false} onChange={onChange} ref={ref}>
        通知
      </Checkbox>,
    );
    const checkbox = screen.getByRole('checkbox', { name: '通知' });
    expect(checkbox).toHaveAttribute('id', 'notify');
    expect(checkbox).not.toBeChecked();
    ref.current?.focus();
    expect(checkbox).toHaveFocus();
    fireEvent.click(checkbox);
    expect(onChange.mock.calls[0]?.[0].target.checked).toBe(true);
    expect(checkbox).not.toBeChecked();
  });

  it('supports uncontrolled, indeterminate, and disabled states', () => {
    const { rerender } = render(<Checkbox defaultChecked>选择</Checkbox>);
    const checkbox = screen.getByRole('checkbox', { name: '选择' });
    expect(checkbox).toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
    rerender(
      <Checkbox indeterminate disabled>
        选择
      </Checkbox>,
    );
    expect(checkbox).toBeDisabled();
    expect((checkbox as HTMLInputElement).indeterminate).toBe(true);
  });
});
