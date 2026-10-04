import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Input, TextArea } from '../index';
import type { InputRef } from '../index';
import styles from '../index.module.css';

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

  it('preserves the caller suffix class while exposing the touch-action styling hook', () => {
    render(
      <Input
        aria-label="名称"
        allowClear
        showCount
        value="杭州云栖科技"
        classNames={{ input: 'caller-input', suffix: 'caller-suffix', count: 'caller-count' }}
      />,
    );

    const clearButton = screen.getByRole('button');

    expect(document.querySelector('.caller-suffix')).toBeInTheDocument();
    expect(clearButton.querySelector(`.${styles.clearMarker}`)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveClass('caller-input');
    expect(document.querySelector('.caller-count')).toBeInTheDocument();
  });

  it('forwards multiline input changes through the same public contract', () => {
    const onChange = vi.fn();
    render(<TextArea aria-label="备注" onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox', { name: '备注' }), {
      target: { value: '跟进记录' },
    });
    expect(onChange).toHaveBeenCalled();
  });

  it('keeps the TextArea suffix class when applying the same touch-action hook', () => {
    render(
      <TextArea
        aria-label="备注"
        allowClear
        showCount
        value="待清除备注"
        classNames={{ textarea: 'caller-textarea', suffix: 'caller-suffix', count: 'caller-count' }}
      />,
    );

    const clearButton = screen.getByRole('button');

    expect(document.querySelector('.caller-suffix')).toBeInTheDocument();
    expect(clearButton.querySelector(`.${styles.clearMarker}`)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveClass('caller-textarea');
    expect(document.querySelector('.caller-count')).toBeInTheDocument();
  });
});
