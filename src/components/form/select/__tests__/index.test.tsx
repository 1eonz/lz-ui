import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Select } from '../index';

describe('Select', () => {
  it('forwards selected values', () => {
    const onChange = vi.fn();
    render(
      <Select aria-label="城市" options={[{ label: '上海', value: 'sh' }]} onChange={onChange} />,
    );
    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('上海'));
    expect(onChange).toHaveBeenCalledWith('sh', expect.anything());
  });

  it('exposes disabled and empty states', () => {
    const { rerender } = render(<Select aria-label="城市" disabled options={[]} />);
    expect(screen.getByRole('combobox')).toBeDisabled();
    rerender(<Select aria-label="城市" options={[]} notFoundContent="没有匹配选项" />);
    fireEvent.mouseDown(screen.getByRole('combobox'));
    expect(screen.getByText('没有匹配选项')).toBeInTheDocument();
  });
});
