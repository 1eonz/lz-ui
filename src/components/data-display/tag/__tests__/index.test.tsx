import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { CheckableTag, Tag } from '..';
import { describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
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

  it('uses the Chinese close name without a locale provider', () => {
    render(<Tag closable>客户</Tag>);
    expect(screen.getByRole('button', { name: '关闭标签' })).toBeInTheDocument();
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

  it('uses the accessible instance default when closable is explicitly enabled', () => {
    render(
      <ConfigProvider
        tag={{
          closable: true,
          closeIcon: (
            <button type="button" aria-label="全局关闭图标">
              全局图标
            </button>
          ),
        }}
      >
        <Tag closable>当前标签</Tag>
      </ConfigProvider>,
    );
    expect(screen.getByRole('button', { name: '关闭标签' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '全局关闭图标' })).not.toBeInTheDocument();
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

  it('uses the accessible name from the explicit closable configuration', () => {
    const onClose = vi.fn();
    render(
      <Tag closable={{ 'aria-label': '移除客户标签' }} onClose={onClose}>
        客户
      </Tag>,
    );
    const close = screen.getByRole('button', { name: '移除客户标签' });
    fireEvent.click(close);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('keeps the Chinese fallback when the AntD locale is English', () => {
    render(
      <ConfigProvider locale={enUS}>
        <Tag closable>Customer</Tag>
      </ConfigProvider>,
    );
    expect(screen.getByRole('button', { name: '关闭标签' })).toBeInTheDocument();
  });

  it('lets a non-Chinese host set a localized close name under the AntD locale provider', () => {
    render(
      <ConfigProvider locale={enUS}>
        <Tag closable={{ 'aria-label': 'Remove customer tag' }}>Customer</Tag>
      </ConfigProvider>,
    );
    expect(screen.getByRole('button', { name: 'Remove customer tag' })).toBeInTheDocument();
  });

  it('uses a custom close icon declared inside the closable configuration', () => {
    render(
      <Tag
        closable={{
          closeIcon: (
            <button type="button" aria-label="移除指定标签">
              移除
            </button>
          ),
        }}
      >
        客户
      </Tag>,
    );
    expect(screen.getByRole('button', { name: '移除指定标签' })).toBeInTheDocument();
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
