import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Tooltip } from '..';

describe('Tooltip 键盘与语义边界', () => {
  it('聚焦原生可操作元素时显示提示，不改变其名字或数据属性', async () => {
    render(
      <Tooltip title="打开客户记录">
        <a aria-label="客户记录" data-route="/customers/28" href="/customers/28">
          客户 28
        </a>
      </Tooltip>,
    );

    const trigger = screen.getByRole('link', { name: '客户记录' });
    fireEvent.focus(trigger);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('打开客户记录');
    expect(trigger).toHaveAttribute('href', '/customers/28');
    expect(trigger).toHaveAttribute('data-route', '/customers/28');
  });

  it('不会将静态 children 强行变成新的键盘停靠点', () => {
    render(
      <Tooltip title="只在鼠标悬停时补充说明">
        <span>处理中</span>
      </Tooltip>,
    );

    expect(screen.getByText('处理中')).not.toHaveAttribute('tabindex');
  });
});
