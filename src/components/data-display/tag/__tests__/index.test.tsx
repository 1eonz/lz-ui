import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { CheckableTag, Tag } from '..';
import { describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from 'antd';
describe('Tag', () => {
  it('does not add closing to ordinary or explicitly non-closable labels', () => {
    render(
      <>
        <Tag>普通</Tag>
        <Tag closable={false}>固定</Tag>
      </>,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('preserves public ConfigProvider defaults with a host accessible close icon', () => {
    render(
      <ConfigProvider
        tag={{
          closable: true,
          closeIcon: (
            <button type="button" aria-label="关闭标签">
              关闭
            </button>
          ),
        }}
      >
        <Tag>默认可关闭</Tag>
        <Tag closable={false}>固定</Tag>
      </ConfigProvider>,
    );
    expect(screen.getAllByRole('button', { name: '关闭标签' })).toHaveLength(1);
  });
  it('provides a native close button and invokes the public callback once', () => {
    const onClose = vi.fn();
    render(
      <Tag closable onClose={onClose}>
        客户
      </Tag>,
    );
    const close = screen.getByRole('button', { name: '关闭标签' });
    expect(close.tagName).toBe('BUTTON');
    expect(close).toHaveAttribute('type', 'button');
    fireEvent.click(close);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('disables the default close button when the public closable configuration requests it', () => {
    const onClose = vi.fn();
    render(
      <Tag closable={{ disabled: true }} onClose={onClose}>
        客户
      </Tag>,
    );
    const close = screen.getByRole('button', { name: '关闭标签' });
    expect(close).toBeDisabled();
    fireEvent.click(close);
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText('客户')).toBeVisible();
  });

  it('preserves preventDefault cancellation and a custom close icon', () => {
    const onClose = vi.fn((event: React.MouseEvent) => event.preventDefault());
    render(
      <Tag
        closable
        onClose={onClose}
        closeIcon={
          <button type="button" aria-label="删除分类">
            删除分类
          </button>
        }
      >
        客户
      </Tag>,
    );
    fireEvent.click(screen.getByRole('button', { name: '删除分类' }));
    expect(screen.getByText('客户')).toBeVisible();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('CheckableTag', () => {
  it('requests controlled selection without mutating checked or submitting a form', () => {
    const onChange = vi.fn();
    const ref = createRef<HTMLButtonElement>();
    const { rerender } = render(
      <CheckableTag ref={ref} checked={false} onChange={onChange}>
        采购
      </CheckableTag>,
    );
    const button = screen.getByRole('button', { name: '采购' });
    expect(ref.current).toBe(button);
    expect(button).toHaveAttribute('type', 'button');
    fireEvent.click(button);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(button).toHaveAttribute('aria-pressed', 'false');
    rerender(
      <CheckableTag ref={ref} checked onChange={onChange}>
        采购
      </CheckableTag>,
    );
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('does not change selection when disabled or cancelled by the host', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <CheckableTag checked={false} disabled onChange={onChange}>
        采购
      </CheckableTag>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onChange).not.toHaveBeenCalled();
    rerender(
      <CheckableTag checked={false} onChange={onChange} onClick={(event) => event.preventDefault()}>
        采购
      </CheckableTag>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
