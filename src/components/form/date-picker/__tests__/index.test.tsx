import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DatePicker, DateRangePicker } from '../index';

describe('DatePicker', () => {
  it('renders a labelled single picker and disabled state', () => {
    render(<DatePicker aria-label="日期" disabled />);
    expect(screen.getByRole('textbox', { name: '日期' })).toBeDisabled();
  });

  it('renders a disabled range picker', () => {
    render(<DateRangePicker disabled allowEmpty={[true, true]} />);
    expect(screen.getAllByRole('textbox')).toHaveLength(2);
    screen.getAllByRole('textbox').forEach((input) => expect(input).toBeDisabled());
  });
});
