import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import DynamicOptionsDemo from '../../docs/demos/dynamic-doc-options';

vi.mock('lx-ui', async () => {
  const [{ Button }, { DynamicForm }] = await Promise.all([
    import('../../src/components/general/button'),
    import('../../src/components/form/dynamic-form'),
  ]);

  return { Button, DynamicForm };
});

vi.mock('../../docs/demos/data-display-demo-frame', () => ({
  DataDisplayDemoFrame: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('DynamicForm 异步选项文档示例', () => {
  it('确认供应商后展示业务名称而非内部 ID', async () => {
    render(<DynamicOptionsDemo />);
    const select = screen.getByRole('combobox', { name: '供应商' });
    fireEvent.mouseDown(select);
    fireEvent.change(select, { target: { value: '杭州' } });

    const error = await screen.findByRole('alert', {}, { timeout: 5000 });
    expect(error).toHaveTextContent('暂时无法搜索“杭州”的供应商，请重试。');
    expect(error).not.toHaveTextContent('本地演示首次检索失败');
    fireEvent.click(screen.getByRole('button', { name: /重试选项\s*供应商/ }));
    const successStatus = await screen.findByText(
      '重试成功，已找到 1 个选项。请重新展开列表选择。',
      {},
      { timeout: 5000 },
    );
    expect(successStatus).toBeVisible();
    fireEvent.mouseDown(select);
    fireEvent.click(await screen.findByText('杭州云栖科技'));
    fireEvent.click(screen.getByRole('button', { name: '确认供应商' }));

    expect(
      await screen.findByText('已选择供应商：杭州云栖科技', {}, { timeout: 5000 }),
    ).toBeInTheDocument();
    expect(screen.queryByText('已选择供应商：supplier-1')).not.toBeInTheDocument();
  }, 15_000);
});
