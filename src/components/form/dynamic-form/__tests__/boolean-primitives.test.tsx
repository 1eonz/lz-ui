import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DynamicForm } from '../index';

describe('DynamicForm boolean primitives', () => {
  it('passes Form.Item checked/onChange/id to Checkbox and Switch', () => {
    const onChange = vi.fn();
    render(
      <DynamicForm
        schema={[
          { key: 'notify', name: 'notify', type: 'checkbox', label: '接收通知' },
          { key: 'enabled', name: 'enabled', type: 'switch', label: '启用' },
        ]}
        onChange={onChange}
      />,
    );
    const checkbox = screen.getByRole('checkbox', { name: '接收通知' });
    const toggle = screen.getByRole('switch', { name: '启用' });
    expect(checkbox).toHaveAttribute('id');
    expect(toggle).toHaveAttribute('id');
    fireEvent.click(checkbox);
    expect(onChange).toHaveBeenLastCalledWith({ notify: true }, { notify: true });
    fireEvent.click(toggle);
    expect(onChange).toHaveBeenLastCalledWith({ enabled: true }, { notify: true, enabled: true });
  });
});
