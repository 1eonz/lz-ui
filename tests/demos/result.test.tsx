import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ResultDemo from '../../docs/demos/result';

vi.mock('lx-ui', async () => {
  const [{ Button }, { RadioGroup }, { Result }] = await Promise.all([
    import('../../src/components/general/button'),
    import('../../src/components/form/radio'),
    import('../../src/components/data-display/result'),
  ]);

  return { Button, RadioGroup, Result };
});

vi.mock('../../docs/demos/data-display-demo-frame', () => ({
  DataDisplayDemoFrame: ({ children, demoId }: { children: React.ReactNode; demoId?: string }) => (
    <div data-testid={demoId}>{children}</div>
  ),
}));

describe('Result 交互文档示例', () => {
  it('失败后可重试恢复成功', () => {
    render(<ResultDemo />);
    const demo = within(screen.getByTestId('result-demo'));
    const status = demo.getByRole('status');

    fireEvent.click(demo.getByRole('radio', { name: '失败' }));
    expect(status).toHaveTextContent('付款凭证提交失败');
    fireEvent.click(demo.getByRole('button', { name: '重试提交' }));
    expect(status).toHaveTextContent('采购付款凭证提交成功');

    fireEvent.click(demo.getByRole('radio', { name: '500' }));
    expect(status).toHaveTextContent('采购服务暂时不可用');
    fireEvent.click(demo.getByRole('button', { name: '重试提交' }));
    expect(status).toHaveTextContent('采购付款凭证提交成功');
  });

  it('403 与 404 只提供说明或返回列表，不显示凭证详情', () => {
    render(<ResultDemo />);
    const demo = within(screen.getByTestId('result-demo'));
    const expectNoReceiptDetails = () => {
      expect(demo.queryByText(/TRX-202410-0982/)).not.toBeInTheDocument();
      expect(demo.queryByText(/¥ 1,280,000\.00/)).not.toBeInTheDocument();
      expect(demo.queryByText(/凭证已保存/)).not.toBeInTheDocument();
    };

    fireEvent.click(demo.getByRole('radio', { name: '403' }));
    expectNoReceiptDetails();
    fireEvent.click(demo.getByRole('button', { name: '返回采购列表' }));
    expect(demo.getByText(/采购列表 · 当前没有可访问的采购记录/)).toBeInTheDocument();
    expectNoReceiptDetails();
    fireEvent.click(demo.getByRole('button', { name: '查看处理说明' }));
    expect(demo.getByText(/请联系权限管理员申请角色/)).toBeInTheDocument();
    expectNoReceiptDetails();

    fireEvent.click(demo.getByRole('radio', { name: '404' }));
    expectNoReceiptDetails();
    fireEvent.click(demo.getByRole('button', { name: '返回采购列表' }));
    expect(demo.getByText(/采购列表 · 当前没有可访问的采购记录/)).toBeInTheDocument();
    expectNoReceiptDetails();
    fireEvent.click(demo.getByRole('button', { name: '查看处理说明' }));
    expect(demo.getByText(/当前编号不存在/)).toBeInTheDocument();
    expectNoReceiptDetails();
  });
});
