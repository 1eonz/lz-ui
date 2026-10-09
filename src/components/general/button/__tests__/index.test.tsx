import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../index';
import type { ButtonRef } from '../index';

describe('Button 按钮', () => {
  it('默认渲染为非提交按钮并转发 ref', () => {
    const ref = createRef<ButtonRef>();
    render(<Button ref={ref}>保存</Button>);
    expect(screen.getByRole('button', { name: '保存' })).toHaveAttribute('type', 'button');
    expect(ref.current).toBe(screen.getByRole('button'));
  });

  it('禁用和加载状态会阻止操作', () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <Button disabled onClick={onClick}>
        保存
      </Button>,
    );
    fireEvent.click(screen.getByRole('button'));
    rerender(
      <Button loading onClick={onClick}>
        保存
      </Button>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('默认和显式 middle 提供固定档位高度 token', () => {
    render(
      <>
        <Button>默认尺寸</Button>
        <Button size="middle">显式 middle</Button>
        <Button size="small">小尺寸</Button>
        <Button size="large">大尺寸</Button>
      </>,
    );

    expect(screen.getByRole('button', { name: '默认尺寸' }).style.height).toBe(
      'var(--lx-control-height, 40px)',
    );
    expect(screen.getByRole('button', { name: '显式 middle' }).style.height).toBe(
      'var(--lx-button-middle-height, 32px)',
    );
    expect(screen.getByRole('button', { name: '小尺寸' }).style.height).toBe('');
    expect(screen.getByRole('button', { name: '大尺寸' }).style.height).toBe('');
  });

  it('调用方的显式高度样式不会被默认档位补值覆盖', () => {
    render(
      <>
        <Button style={{ height: 24 }}>自定义高度</Button>
        <Button size="middle" style={{ height: 26 }}>
          显式档位自定义高度
        </Button>
        <Button size="middle" style={{ minHeight: 28 }}>
          自定义最小高度
        </Button>
      </>,
    );

    const customHeight = screen.getByRole('button', { name: '自定义高度' });
    expect(customHeight.style.height).toBe('24px');
    expect(customHeight.style.minHeight).toBe('');

    const explicitTierHeight = screen.getByRole('button', { name: '显式档位自定义高度' });
    expect(explicitTierHeight.style.height).toBe('26px');
    expect(explicitTierHeight.style.minHeight).toBe('');

    const customMinHeight = screen.getByRole('button', { name: '自定义最小高度' });
    expect(customMinHeight.style.height).toBe('var(--lx-button-middle-height, 32px)');
    expect(customMinHeight.style.minHeight).toBe('28px');
  });
});
