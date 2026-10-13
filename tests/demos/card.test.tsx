import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CardAppearancesDemo from '../../docs/demos/card-appearances';
import CardDemo from '../../docs/demos/card';
import CardStatesDemo from '../../docs/demos/card-states';

vi.mock('lx-ui', async () => {
  const [
    { LxConfigProvider, useLxTheme },
    { Alert },
    { Button },
    { Card },
    { Empty },
    { RadioGroup },
    { Statistic },
  ] = await Promise.all([
    import('../../src/theme/provider'),
    import('../../src/components/feedback/alert'),
    import('../../src/components/general/button'),
    import('../../src/components/data-display/card'),
    import('../../src/components/data-display/empty'),
    import('../../src/components/form/radio'),
    import('../../src/components/data-display/statistic'),
  ]);

  return { Alert, Button, Card, Empty, LxConfigProvider, RadioGroup, Statistic, useLxTheme };
});

vi.mock('lx-ui/antd', async () => {
  const { Tabs } = await import('../../src/antd');
  return { Tabs };
});

// jsdom 没有真实布局尺寸，禁用异步测量；Tabs 的几何与焦点由浏览器用例覆盖。
vi.mock('resize-observer-polyfill', () => ({
  default: class {
    observe() {}

    unobserve() {}

    disconnect() {}
  },
}));

vi.mock('../../docs/demos/data-display-demo-frame', async () => {
  const { LxConfigProvider } = await import('../../src/theme/provider');
  return {
    DataDisplayDemoFrame: ({
      children,
      demoId,
    }: {
      children: React.ReactNode;
      demoId?: string;
    }) => (
      <LxConfigProvider theme={{ mode: 'light', persist: false }}>
        <div data-testid={demoId}>{children}</div>
      </LxConfigProvider>
    ),
  };
});

describe('Card 交互文档示例', () => {
  it('为三种外观分别挂载真实主题 Provider', () => {
    render(<CardAppearancesDemo />);
    const demo = screen.getByTestId('card-appearance-demo');
    const expected = [
      ['business', 'Business', '适合财务与运营后台'],
      ['soft', 'Soft', '适合轻量分组与运营工作台'],
      ['glass', 'Glass', '适合有内容底图的展示面板'],
    ] as const;

    for (const [appearance, label, useCase] of expected) {
      const card = within(demo).getByTestId(`card-appearance-${appearance}`);
      const provider = card.closest('[data-lx-appearance]');
      expect(card).toHaveTextContent(label);
      expect(within(card).getByText(useCase)).toBeInTheDocument();
      expect(within(card).getByText('12 笔待复核')).toBeInTheDocument();
      expect(within(card).getByText('预警金额 ¥284,600')).toBeInTheDocument();
      expect(provider).toHaveAttribute('data-lx-appearance', appearance);
      expect(provider).toHaveAttribute('data-lx-mode', 'light');
      expect(provider).toHaveAttribute('data-lx-density', 'comfortable');
      expect(provider).toHaveAttribute('data-lx-color', 'blue');
    }

    const glassBackdrop = within(demo).getByTestId('card-appearance-glass-backdrop');
    expect(glassBackdrop).toHaveAttribute('aria-hidden', 'true');
    expect(glassBackdrop.closest('[data-lx-appearance]')).toHaveAttribute(
      'data-lx-appearance',
      'glass',
    );
    expect(glassBackdrop.children).toHaveLength(3);
  });

  it('提供业务指标上下文、加载状态和加载完成后的正文恢复', async () => {
    render(<CardDemo />);
    const card = screen.getByTestId('card-demo');

    expect(screen.getByRole('region', { name: '运营指标概览' })).toBeInTheDocument();
    expect(card).toHaveAttribute('aria-busy', 'false');
    const tabs = screen.getAllByRole('tab');
    const panel = screen.getByRole('tabpanel');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[0]).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveAttribute('aria-labelledby', tabs[0].id);
    expect(panel).toContainElement(screen.getByText('采购总计单量'));
    expect(panel).toContainElement(screen.getByText('↑ 8.2% 同比上期'));
    expect(panel).toContainElement(screen.getByText('92 个承运单在途'));
    expect(panel).toContainElement(screen.getByText('高于预警阈值 10%'));
    expect(panel).toContainElement(screen.getByText('达标 A 级标杆'));
    expect(panel).toContainElement(screen.getByText('¥'));

    await act(async () => {
      fireEvent.keyDown(tabs[0], { key: 'ArrowRight', code: 'ArrowRight' });
    });
    expect(tabs[1]).toHaveFocus();
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
    await act(async () => {
      fireEvent.keyDown(tabs[1], { key: 'Enter', code: 'Enter' });
    });
    const supplyPanel = screen.getByRole('tabpanel');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveAttribute('aria-controls', supplyPanel.id);
    expect(supplyPanel).toHaveAttribute('aria-labelledby', tabs[1].id);
    expect(supplyPanel).toContainElement(screen.getByText('高风险供应商'));

    const periodHeader = within(screen.getByTestId('card-demo-frame')).getByTestId(
      'card-period-header',
    );
    expect(periodHeader).toHaveTextContent('近 30 天');
    await act(async () => {
      fireEvent.click(tabs[2]);
    });
    expect(periodHeader).toHaveTextContent('本季度');
    await act(async () => {
      fireEvent.click(tabs[1]);
    });

    const loadingButton = screen.getByRole('button', { name: '显示加载' });
    const completeButton = screen.getByRole('button', { name: '完成加载' });
    act(() => loadingButton.focus());
    await act(async () => {
      fireEvent.click(loadingButton);
    });
    expect(card).toHaveAttribute('aria-busy', 'true');
    expect(loadingButton).toBeDisabled();
    expect(completeButton).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent('运营指标加载中');
    expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.click(completeButton);
    });
    expect(card).toHaveAttribute('aria-busy', 'false');
    expect(screen.getByRole('button', { name: '显示加载' })).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent('运营指标已加载');
    expect(screen.getAllByRole('tab')[1]).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toContainElement(screen.getByText('高风险供应商'));
  });

  it('区分空内容与请求失败，并允许创建或重试恢复', () => {
    render(<CardStatesDemo />);
    const demo = within(screen.getByTestId('card-states-demo'));
    const stateGroup = within(demo.getByRole('group', { name: '供应商资料状态' }));

    expect(stateGroup.getByRole('radio', { name: '暂无数据' })).toBeInTheDocument();
    expect(demo.getByRole('heading', { name: '供应商资料', level: 3 })).toBeInTheDocument();
    expect(demo.getByText('暂无供应商资料')).toBeInTheDocument();
    fireEvent.click(demo.getByRole('button', { name: '添加供应商' }));
    expect(
      demo.getByRole('heading', { name: '供应商档案：华东精密制造有限公司', level: 4 }),
    ).toHaveFocus();
    expect(demo.getByText('供应商档案：华东精密制造有限公司')).toBeInTheDocument();

    fireEvent.click(stateGroup.getByRole('radio', { name: '加载失败' }));
    expect(demo.getByRole('alert')).toHaveTextContent('供应商资料加载失败');
    fireEvent.click(demo.getByRole('button', { name: '重试' }));
    expect(
      demo.getByRole('heading', { name: '供应商档案：华东精密制造有限公司', level: 4 }),
    ).toHaveFocus();
    expect(demo.getByText('供应商档案：华东精密制造有限公司')).toBeInTheDocument();
    expect(demo.getByRole('status')).toHaveTextContent('当前状态：供应商资料已恢复');
  });

  it('直接选择已恢复状态时不抢走状态单选控件的焦点', () => {
    render(<CardStatesDemo />);
    const demo = within(screen.getByTestId('card-states-demo'));
    const stateGroup = within(demo.getByRole('group', { name: '供应商资料状态' }));
    const readyOption = stateGroup.getByRole('radio', { name: '已恢复' });

    readyOption.focus();
    fireEvent.click(readyOption);

    expect(readyOption).toHaveFocus();
    expect(
      demo.getByRole('heading', { name: '供应商档案：华东精密制造有限公司', level: 4 }),
    ).toBeInTheDocument();
  });
});
