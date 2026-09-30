import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Radio } from '../index';

describe('Radio', () => {
  it('supports controlled groups and keyboard selection', () => {
    const onChange = vi.fn();
    render(
      <Radio.Group
        aria-label="模式"
        options={[
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ]}
        value="a"
        onChange={onChange}
      />,
    );
    const a = screen.getByRole('radio', { name: 'A' });
    expect(a).toBeChecked();
    fireEvent.keyDown(a, { key: 'ArrowRight' });
    fireEvent.click(screen.getByRole('radio', { name: 'B' }));
    expect(onChange).toHaveBeenCalled();
  });
  it('supports disabled options', () => {
    render(<Radio.Group options={[{ label: '禁用', value: 'x', disabled: true }]} />);
    expect(screen.getByRole('radio', { name: '禁用' })).toBeDisabled();
  });
});
