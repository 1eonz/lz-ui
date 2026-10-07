import { act, fireEvent, render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { LxTableProps } from '../../src/components/data-display/table';
import TableDemo from '../../docs/demos/table';
import TableBasicDemo from '../../docs/demos/table-basic';
import TableFixedColumnsDemo from '../../docs/demos/table-fixed-columns';

const mocks = vi.hoisted(() => ({
  tableProps: vi.fn<(props: object) => void>(),
  densitySwitchVisibility: [] as boolean[],
}));

vi.mock('lx-ui', async () => {
  const [
    { Button },
    { Empty },
    { Progress },
    { Result },
    { Table: ActualTable },
    { Tag },
    { RadioGroup },
    { Select },
    theme,
  ] = await Promise.all([
    import('../../src/components/general/button'),
    import('../../src/components/data-display/empty'),
    import('../../src/components/feedback/progress'),
    import('../../src/components/data-display/result'),
    import('../../src/components/data-display/table'),
    import('../../src/components/data-display/tag'),
    import('../../src/components/form/radio'),
    import('../../src/components/form/select'),
    import('../../src/theme/provider'),
  ]);

  function CapturedTable<T extends object>(props: LxTableProps<T>) {
    mocks.tableProps(props);
    return <ActualTable<T> {...props} />;
  }

  return {
    Button,
    Empty,
    Progress,
    Result,
    Table: CapturedTable,
    Tag,
    RadioGroup,
    Select,
    LxConfigProvider: theme.LxConfigProvider,
    useLxTheme: theme.useLxTheme,
  };
});

vi.mock('../../docs/demos/data-display-demo-frame', async () => {
  const { LxConfigProvider } = await import('lx-ui');
  return {
    DataDisplayDemoFrame: ({
      children,
      showDensitySwitch = true,
    }: {
      children: ReactNode;
      showDensitySwitch?: boolean;
    }) => {
      mocks.densitySwitchVisibility.push(showDensitySwitch);
      return (
        <LxConfigProvider theme={{ density: 'comfortable', persist: false }}>
          {children}
        </LxConfigProvider>
      );
    },
  };
});

beforeEach(() => {
  mocks.tableProps.mockClear();
  mocks.densitySwitchVisibility.length = 0;
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function getTableProps() {
  const props = mocks.tableProps.mock.calls.at(-1)?.[0];
  expect(props).toBeDefined();
  return props as unknown as {
    columns?: Array<{
      key?: string;
      fixed?: boolean | 'left' | 'right';
      width?: number;
      onHeaderCell?: () => { className?: string };
      sortOrder?: 'ascend' | 'descend' | null;
      showSorterTooltip?: boolean;
    }>;
    pagination?: LxTableProps<object>['pagination'];
    rowSelection?: { fixed?: boolean | 'left' | 'right' };
    scroll?: { x?: number | string };
    style?: { minInlineSize?: number };
    onChange?: LxTableProps<object>['onChange'];
  };
}

describe('Table 文档示例', () => {
  it('固定列详情通过受控 ARIA 关系展示完整字段并恢复关闭焦点', () => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}

        disconnect() {}
      },
    );
    render(<TableFixedColumnsDemo />);

    const firstTrigger = screen.getByRole('button', { name: '查看订单 PO-2026-1041 详情' });
    const secondTrigger = screen.getByRole('button', { name: '查看订单 PO-2026-1042 详情' });
    const panelId = firstTrigger.getAttribute('aria-controls');
    expect(panelId).toBeTruthy();
    expect(secondTrigger).toHaveAttribute('aria-controls', panelId);
    expect(firstTrigger).toHaveAttribute('aria-expanded', 'false');
    expect(document.getElementById(panelId!)).toHaveAttribute('hidden');

    firstTrigger.focus();
    fireEvent.click(firstTrigger);
    const firstPanel = screen.getByRole('region', { name: '订单详情 PO-2026-1041' });
    const firstHeading = within(firstPanel).getByRole('heading', {
      name: '订单详情 PO-2026-1041',
    });
    expect(firstTrigger).toHaveAttribute('aria-expanded', 'true');
    expect(firstTrigger).toHaveAttribute('aria-controls', firstPanel.id);
    expect(firstPanel).toHaveAttribute('aria-labelledby', firstHeading.id);
    expect(firstHeading).toHaveFocus();
    expect(
      within(firstPanel)
        .getAllByRole('group')
        .map((group) => group.getAttribute('aria-labelledby')),
    ).toHaveLength(3);
    expect(
      within(firstPanel)
        .getAllByRole('group')
        .map((group) => group.textContent),
    ).toEqual([
      expect.stringContaining('审批与金额'),
      expect.stringContaining('订单信息'),
      expect.stringContaining('采购归属'),
    ]);
    expect(within(firstPanel).getByRole('group', { name: '订单信息' })).toBeInTheDocument();
    expect(within(firstPanel).getByRole('group', { name: '采购归属' })).toBeInTheDocument();
    expect(within(firstPanel).getByRole('group', { name: '审批与金额' })).toBeInTheDocument();
    expect(
      within(firstPanel)
        .getAllByRole('term')
        .map((field) => field.textContent),
    ).toEqual(['采购金额', '审批状态', '订单编号', '供应商', '下单日期', '所属部门', '采购员']);
    expect(
      within(firstPanel)
        .getAllByRole('definition')
        .map((field) => field.textContent?.trim()),
    ).toEqual([
      '¥ 1,428,900',
      '待审批',
      'PO-2026-1041',
      '上海深蓝光电高新材料有限公司',
      '2026-09-18',
      '精密制造中心',
      '周敏',
    ]);

    fireEvent.click(secondTrigger);
    const secondPanel = screen.getByRole('region', { name: '订单详情 PO-2026-1042' });
    expect(firstTrigger).toHaveAttribute('aria-expanded', 'false');
    expect(secondTrigger).toHaveAttribute('aria-expanded', 'true');
    expect(
      within(secondPanel).getByRole('heading', {
        level: 4,
        name: '订单详情 PO-2026-1042',
      }),
    ).toHaveFocus();
    expect(
      within(secondPanel)
        .getAllByRole('definition')
        .map((field) => field.textContent?.trim()),
    ).toEqual([
      '¥ 3,892,150',
      '已审批',
      'PO-2026-1042',
      '深圳创智精密半导体装备股份有限公司华南区域战略供应商',
      '2026-09-19',
      '半导体事业部',
      '陈立',
    ]);

    fireEvent.click(within(secondPanel).getByRole('button', { name: '关闭订单详情' }));
    expect(secondPanel).toHaveAttribute('hidden');
    expect(secondTrigger).toHaveAttribute('aria-expanded', 'false');
    expect(secondTrigger).toHaveFocus();
  });

  it('基础示例仅在实际横移时取消方向键默认行为', () => {
    render(<TableBasicDemo />);
    const region = screen.getByRole('region', { name: '基础采购订单表格' });
    expect(region).toHaveAttribute('tabindex', '0');
    region.focus();
    expect(region).toHaveFocus();

    let scrollLeft = 0;
    Object.defineProperties(region, {
      clientWidth: { configurable: true, value: 240 },
      scrollWidth: { configurable: true, value: 480 },
      scrollLeft: {
        configurable: true,
        get: () => scrollLeft,
        set: (value: number) => {
          scrollLeft = Math.max(0, Math.min(value, 240));
        },
      },
    });

    const dispatchArrow = (key: 'ArrowLeft' | 'ArrowRight', init: KeyboardEventInit = {}) => {
      const event = new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        cancelable: true,
        ...init,
      });
      fireEvent(region, event);
      return event;
    };

    const leftAtStart = dispatchArrow('ArrowLeft');
    expect(leftAtStart.defaultPrevented).toBe(false);
    expect(region.scrollLeft).toBe(0);

    const rightInRange = dispatchArrow('ArrowRight');
    expect(rightInRange.defaultPrevented).toBe(true);
    expect(region.scrollLeft).toBe(80);
    fireEvent.keyDown(screen.getByRole('columnheader', { name: '采购单' }), { key: 'ArrowLeft' });
    expect(region.scrollLeft).toBe(80);
    const leftInRange = dispatchArrow('ArrowLeft');
    expect(leftInRange.defaultPrevented).toBe(true);
    expect(region.scrollLeft).toBe(0);

    region.scrollLeft = 240;
    const rightAtEnd = dispatchArrow('ArrowRight');
    expect(rightAtEnd.defaultPrevented).toBe(false);
    expect(region.scrollLeft).toBe(240);

    for (const modifier of ['altKey', 'ctrlKey', 'metaKey', 'shiftKey']) {
      const event = dispatchArrow('ArrowLeft', { [modifier]: true });
      expect(event.defaultPrevented).toBe(false);
      expect(region.scrollLeft).toBe(240);
    }
  });

  it('同一订单详情再次查看时仍定位已有详情标题', () => {
    render(<TableDemo />);
    const trigger = screen.getByRole('button', { name: '查看 PO-2024-1881 详情' });
    fireEvent.click(trigger);
    const heading = screen.getByRole('heading', { name: '采购订单 PO-2024-1881 详情' });
    expect(heading).toHaveFocus();

    trigger.focus();
    fireEvent.click(trigger);
    expect(heading).toHaveFocus();
    expect(screen.getByRole('heading', { name: '采购订单 PO-2024-1881 详情' })).toBe(heading);
  });

  it('打开详情后命名区域并聚焦详情标题，收起后回到原行详情按钮', () => {
    render(<TableDemo />);
    const trigger = screen.getByRole('button', { name: '查看 PO-2024-1881 详情' });
    trigger.focus();
    fireEvent.click(trigger);

    const region = screen.getByRole('region', { name: '采购订单 PO-2024-1881 详情' });
    expect(
      within(region).getByRole('heading', { name: '采购订单 PO-2024-1881 详情' }),
    ).toHaveFocus();
    expect(
      within(region)
        .getAllByRole('group')
        .map((group) => group.getAttribute('aria-labelledby')),
    ).toHaveLength(3);
    expect(within(region).getByRole('group', { name: '采购信息' })).toBeInTheDocument();
    expect(within(region).getByRole('group', { name: '履约进度' })).toBeInTheDocument();
    expect(within(region).getByRole('group', { name: '审批与结算' })).toBeInTheDocument();
    expect(
      within(region)
        .getAllByRole('term')
        .map((field) => field.textContent),
    ).toEqual(['订单编号', '供应商', '订单履约', '采购金额', '审批状态']);
    expect(
      within(region)
        .getAllByRole('definition')
        .map((field) => field.textContent?.replace(/\s+/g, ' ').trim()),
    ).toEqual(['PO-2024-1881', '上海深蓝光电高新材料有限公司', '82%', '¥ 1,428,900.00', '已审批']);
    expect(within(region).getByRole('progressbar', { name: '订单履约进度' })).toHaveAttribute(
      'aria-valuenow',
      '82',
    );
    expect(within(region).getByText('¥ 1,428,900.00')).toBeInTheDocument();
    expect(within(region).getByText('已审批')).toBeInTheDocument();
    fireEvent.click(within(region).getByRole('button', { name: '收起详情' }));

    expect(
      screen.queryByRole('region', { name: '采购订单 PO-2024-1881 详情' }),
    ).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('翻页关闭详情并恢复已卸载焦点，分页控件主动获焦时保持其焦点', () => {
    render(<TableDemo />);
    fireEvent.click(screen.getByRole('button', { name: '查看 PO-2024-1881 详情' }));
    fireEvent.click(screen.getByRole('button', { name: /^下一页$/ }));
    expect(
      screen.queryByRole('region', { name: '采购订单 PO-2024-1881 详情' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '采购订单' })).toHaveFocus();

    fireEvent.click(screen.getByRole('button', { name: '查看 PO-2024-1886 详情' }));
    const nextPage = screen.getByRole('button', { name: /^下一页$/ });
    nextPage.focus();
    fireEvent.click(nextPage);
    expect(
      screen.queryByRole('region', { name: '采购订单 PO-2024-1886 详情' }),
    ).not.toBeInTheDocument();
    expect(nextPage).toHaveFocus();
  });

  it.each(['显示加载', '模拟失败', '显示空状态'])('%s 关闭详情且保留操作控件的焦点', (name) => {
    render(<TableDemo />);
    fireEvent.click(screen.getByRole('button', { name: '查看 PO-2024-1881 详情' }));
    fireEvent.click(screen.getByText('示例状态'));
    const trigger = screen.getByRole('button', { name });
    trigger.focus();
    fireEvent.click(trigger);
    expect(
      screen.queryByRole('region', { name: '采购订单 PO-2024-1881 详情' }),
    ).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('页大小变化关闭详情并保留页大小控件焦点', () => {
    render(<TableDemo />);
    fireEvent.click(screen.getByRole('button', { name: '查看 PO-2024-1881 详情' }));
    const pageSize = screen.getByRole('combobox', { name: '每页条数' });
    pageSize.focus();
    fireEvent.keyDown(pageSize, { key: 'ArrowDown', keyCode: 40 });
    fireEvent.keyDown(pageSize, { key: 'ArrowDown', keyCode: 40 });
    fireEvent.keyDown(pageSize, { key: 'Enter', keyCode: 13 });
    expect(screen.getByRole('status')).toHaveTextContent('每页 10 条');
    expect(
      screen.queryByRole('region', { name: '采购订单 PO-2024-1881 详情' }),
    ).not.toBeInTheDocument();
    expect(pageSize).toHaveFocus();
  });

  it('自有分页使用命名导航、原生按钮和当前页语义', () => {
    render(<TableDemo />);
    const pagination = screen.getByRole('navigation', { name: '采购订单分页' });
    const previousPage = within(pagination).getByRole('button', { name: '上一页' });
    const firstPage = within(pagination).getByRole('button', { name: '第 1 页' });
    expect(previousPage).toBeDisabled();
    expect(firstPage).toHaveAttribute('aria-current', 'page');

    fireEvent.click(within(pagination).getByRole('button', { name: '第 2 页' }));
    expect(screen.getByRole('status')).toHaveTextContent(
      '当前显示 5 条采购订单，每页 5 条，已选择 0 条',
    );
    expect(within(pagination).getByRole('button', { name: '第 2 页' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(pagination).getByRole('button', { name: '下一页' })).toBeEnabled();
  });

  it('窄分页可直接跳页，并将当前页播报与结果状态分开', () => {
    render(<TableDemo />);
    const scrollHint = screen.getByText(
      '可左右滑动查看完整表格；按 Tab 聚焦表格区域后，左右方向键横向滚动，不会在单元格间移动焦点。',
      { exact: true },
    );
    scrollHint.style.setProperty('--lx-table-compact-pagination', '1');
    fireEvent.resize(window);

    const jump = screen.getByRole('combobox', { name: '跳至页码' });
    jump.focus();
    fireEvent.keyDown(jump, { key: 'ArrowDown', keyCode: 40 });
    fireEvent.keyDown(jump, { key: 'ArrowDown', keyCode: 40 });
    fireEvent.keyDown(jump, { key: 'Enter', keyCode: 13 });

    const pageAnnouncement = screen.getByText('第 2 页，共 5 页', { exact: true });
    expect(pageAnnouncement).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByRole('status')).toHaveTextContent(
      '当前显示 5 条采购订单，每页 5 条，已选择 0 条',
    );
    expect(screen.getByRole('status')).not.toHaveTextContent('第 2 页');
    expect(screen.getByRole('checkbox', { name: '选择采购单 PO-2024-1886' })).toBeInTheDocument();
  });

  it.each([10, 20])('排序回调为空或带 AntD 默认值时仍保留每页 %i 条', (nextPageSize) => {
    render(<TableDemo />);
    const pageSize = screen.getByRole('combobox', { name: '每页条数' });
    pageSize.focus();
    for (let index = 0; index < (nextPageSize === 10 ? 2 : 3); index += 1) {
      fireEvent.keyDown(pageSize, { key: 'ArrowDown', keyCode: 40 });
    }
    fireEvent.keyDown(pageSize, { key: 'Enter', keyCode: 13 });
    expect(screen.getByRole('status')).toHaveTextContent(`每页 ${nextPageSize} 条`);

    const tableProps = getTableProps();
    expect(tableProps.pagination).toBe(false);
    expect(tableProps.columns?.find((column) => column.key === 'amount')?.showSorterTooltip).toBe(
      false,
    );
    act(() =>
      tableProps.onChange!(
        { current: 1, pageSize: 5 },
        {},
        { columnKey: 'amount', order: 'ascend' },
        { currentDataSource: [], action: 'sort' },
      ),
    );

    expect(screen.getByRole('status')).toHaveTextContent(
      `当前显示 ${nextPageSize === 10 ? 10 : 20} 条采购订单，每页 ${nextPageSize} 条，已选择 0 条`,
    );
    expect(getTableProps().columns?.find((column) => column.key === 'amount')?.sortOrder).toBe(
      'ascend',
    );

    act(() =>
      getTableProps().onChange!(
        {},
        {},
        { columnKey: 'amount', order: 'descend' },
        { currentDataSource: [], action: 'sort' },
      ),
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      `当前显示 ${nextPageSize === 10 ? 10 : 20} 条采购订单，每页 ${nextPageSize} 条，已选择 0 条`,
    );
  });

  it('已选列表跨页与筛选保留订单身份、供应商、审批状态和金额', () => {
    render(<TableDemo />);
    fireEvent.click(screen.getByRole('checkbox', { name: '选择采购单 PO-2024-1881' }));
    fireEvent.click(screen.getByRole('button', { name: /^下一页$/ }));
    fireEvent.click(screen.getByRole('checkbox', { name: '选择采购单 PO-2024-1886' }));
    const summary = screen.getByText('已选订单（2）');
    expect(summary.parentElement).not.toHaveAttribute('open');
    fireEvent.click(summary);
    const list = screen.getByRole('list', { name: '已选采购订单' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    expect(list).toHaveTextContent('PO-2024-1881 · 上海深蓝光电高新材料有限公司 · 已审批');
    expect(list).toHaveTextContent('¥ 1,428,900.00');

    fireEvent.click(screen.getByRole('button', { name: '查看 PO-2024-1886 详情' }));
    const filter = screen.getByRole('combobox', { name: '审批状态快速筛选' });
    filter.focus();
    fireEvent.keyDown(filter, { key: 'ArrowDown', keyCode: 40 });
    fireEvent.keyDown(filter, { key: 'ArrowDown', keyCode: 40 });
    fireEvent.keyDown(filter, { key: 'ArrowDown', keyCode: 40 });
    fireEvent.keyDown(filter, { key: 'Enter', keyCode: 13 });
    expect(filter).toHaveFocus();
    expect(
      screen.queryByRole('region', { name: '采购订单 PO-2024-1886 详情' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('checkbox', { name: '选择采购单 PO-2024-1881' }),
    ).not.toBeInTheDocument();
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: '取消选择' }));
    expect(screen.queryByRole('list', { name: '已选采购订单' })).not.toBeInTheDocument();
    expect(screen.getByText('暂无已选订单')).toBeVisible();
  });

  it('Table 示例隐藏通用密度开关并保留自有密度单选控件', () => {
    render(<TableDemo />);
    expect(mocks.densitySwitchVisibility).toEqual([false]);
    expect(screen.getByRole('radio', { name: '舒适 · 48px 基础' })).toBeInTheDocument();

    const toolbar = screen.getByRole('group', { name: '表格工具栏' });
    expect(within(toolbar).getByRole('combobox', { name: '审批状态快速筛选' })).toBeInTheDocument();
    expect(within(toolbar).getByRole('button', { name: '取消选择' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '采购订单' }).parentElement).toContainElement(
      screen.getByRole('radio', { name: '舒适 · 48px 基础' }),
    );

    const exampleStates = screen.getByText('示例状态');
    expect(exampleStates.parentElement).not.toHaveAttribute('open');
    expect(screen.getByRole('button', { name: '模拟失败' }).closest('details')).toBe(
      exampleStates.parentElement,
    );
    fireEvent.click(exampleStates);
    expect(exampleStates.parentElement).toHaveAttribute('open');
    expect(screen.getByRole('button', { name: '模拟失败' })).toBeInTheDocument();
  });

  it('为行选择和当前页全选提供可访问名称并更新选择数', () => {
    render(<TableDemo />);

    const firstRow = screen.getByRole('checkbox', { name: '选择采购单 PO-2024-1881' });
    const selectCurrentPage = screen.getByRole('checkbox', {
      name: '选择当前页全部采购单',
    });

    fireEvent.click(firstRow);
    expect(screen.getByRole('status')).toHaveTextContent('已选择 1 条');

    fireEvent.click(selectCurrentPage);
    expect(screen.getByRole('status')).toHaveTextContent('已选择 5 条');
  });

  it('展开按钮按订单编号命名、同步 aria 状态并显示分期详情', () => {
    render(<TableDemo />);
    const expand = screen.getByRole('button', { name: '展开采购订单 PO-2024-1881' });
    expect(expand.tagName).toBe('BUTTON');
    expect(expand).toHaveAttribute('aria-expanded', 'false');
    expect(expand).toHaveAttribute('title', '展开采购订单 PO-2024-1881');
    expect(expand).not.toHaveTextContent('展开');
    expand.focus();
    expect(expand).toHaveFocus();
    expect(screen.getByRole('button', { name: '展开采购订单 PO-2024-1882' })).toBeInTheDocument();

    const bubbledClick = vi.fn();
    document.body.addEventListener('click', bubbledClick);
    fireEvent.click(expand);
    expect(bubbledClick).not.toHaveBeenCalled();
    document.body.removeEventListener('click', bubbledClick);

    const collapse = screen.getByRole('button', { name: '收起采购订单 PO-2024-1881' });
    expect(collapse).toHaveAttribute('aria-expanded', 'true');
    expect(collapse).toHaveAttribute('title', '收起采购订单 PO-2024-1881');
    expect(collapse).not.toHaveTextContent('收起');
    expect(screen.getByText(/首期款项 30%/)).toBeInTheDocument();
    expect(screen.getByText(/中期款项 50%/)).toBeInTheDocument();
    expect(screen.getByText(/尾款 20%/)).toBeInTheDocument();

    fireEvent.click(collapse);
    expect(screen.getByRole('button', { name: '展开采购订单 PO-2024-1881' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.getByText(/首期款项 30%/)).not.toBeVisible();
  });

  it('取消选择后把焦点移到始终可见的表格标题', () => {
    render(<TableDemo />);
    const heading = screen.getByRole('heading', { name: '采购订单' });
    expect(heading).toHaveAttribute('tabindex', '-1');

    fireEvent.click(screen.getByRole('checkbox', { name: '选择采购单 PO-2024-1881' }));
    fireEvent.click(screen.getByRole('button', { name: '取消选择' }));

    expect(heading).toHaveFocus();
  });

  it('失败状态重试后把焦点移到始终可见的表格标题', () => {
    render(<TableDemo />);
    fireEvent.click(screen.getByText('示例状态'));
    fireEvent.click(screen.getByRole('button', { name: '模拟失败' }));
    fireEvent.click(screen.getByRole('button', { name: '重试' }));

    expect(screen.getByRole('heading', { name: '采购订单' })).toHaveFocus();
    expect(screen.getByRole('region', { name: '采购订单表格' })).toBeInTheDocument();
  });

  it('密度单选控件通过 LxTheme 切换表格密度', () => {
    const { container } = render(<TableDemo />);
    const themeRoot = container.querySelector('[data-lx-density]');
    expect(themeRoot).toHaveAttribute('data-lx-density', 'comfortable');

    fireEvent.click(screen.getByRole('radio', { name: '紧凑 · 36px 基础' }));

    expect(themeRoot).toHaveAttribute('data-lx-density', 'compact');
    expect(screen.getByRole('radio', { name: '紧凑 · 36px 基础' })).toBeChecked();
  });

  it('金额排序表头有自定义焦点目标并支持键盘触发排序', () => {
    render(<TableDemo />);
    const header = screen.getByRole('columnheader', { name: '结算金额' });
    const amountColumn = getTableProps().columns?.find((column) => column.key === 'amount');
    const sortableHeaderClass = amountColumn?.onHeaderCell?.().className;

    expect(header).toHaveAttribute('tabindex', '0');
    expect(sortableHeaderClass).toBeTruthy();
    expect(header.classList).toContain(sortableHeaderClass);
    header.focus();
    expect(header).toHaveFocus();
    fireEvent.keyDown(header, { key: 'Enter', keyCode: 13 });

    expect(header).toHaveFocus();
    expect(getTableProps().columns?.find((column) => column.key === 'amount')?.sortOrder).toBe(
      'ascend',
    );
  });

  it('审批状态快速筛选支持键盘选择、重置页码并更新过滤结果和总数', () => {
    const { container } = render(<TableDemo />);
    expect(screen.getByText('共 24 条')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^下一页$/ }));
    expect(screen.getByText('第 2 页，共 5 页', { exact: true })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: '选择采购单 PO-2024-1886' })).toBeInTheDocument();

    const filter = screen.getByRole('combobox', { name: '审批状态快速筛选' });
    filter.focus();
    expect(filter).toHaveFocus();
    fireEvent.keyDown(filter, { key: 'ArrowDown', keyCode: 40 });
    fireEvent.keyDown(filter, { key: 'ArrowDown', keyCode: 40 });
    fireEvent.keyDown(filter, { key: 'Enter', keyCode: 13 });

    expect(filter).toHaveFocus();
    expect(screen.getByText('第 1 页，共 4 页', { exact: true })).toBeInTheDocument();
    expect(screen.getByText('共 16 条')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: '选择采购单 PO-2024-1881' })).toBeInTheDocument();
    expect(
      screen.queryByRole('checkbox', { name: '选择采购单 PO-2024-1882' }),
    ).not.toBeInTheDocument();
    const statuses = Array.from(container.querySelectorAll('td'))
      .map((cell) => cell.textContent?.trim())
      .filter((value) => value === '已审批' || value === '待审批');
    expect(statuses.length).toBeGreaterThan(0);
    expect(statuses.every((value) => value === '已审批')).toBe(true);
  });

  it('筛选隐藏已选的已审批订单时仍保留选择计数，并可取消选择', () => {
    render(<TableDemo />);
    fireEvent.click(screen.getByRole('checkbox', { name: '选择采购单 PO-2024-1881' }));
    expect(screen.getByRole('status')).toHaveTextContent('已选择 1 条');

    const filter = screen.getByRole('combobox', { name: '审批状态快速筛选' });
    filter.focus();
    fireEvent.keyDown(filter, { key: 'ArrowDown', keyCode: 40 });
    fireEvent.keyDown(filter, { key: 'ArrowDown', keyCode: 40 });
    fireEvent.keyDown(filter, { key: 'ArrowDown', keyCode: 40 });
    fireEvent.keyDown(filter, { key: 'Enter', keyCode: 13 });

    expect(
      screen.queryByRole('checkbox', { name: '选择采购单 PO-2024-1881' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: '选择采购单 PO-2024-1882' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('已选择 1 条');
    fireEvent.click(screen.getByRole('button', { name: '取消选择' }));
    expect(screen.getByRole('status')).toHaveTextContent('已选择 0 条');
  });

  it('按设计稿展示有可访问名称的确定履约进度', () => {
    render(<TableDemo />);

    expect(screen.getByRole('columnheader', { name: '履约达成进度' })).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: '采购单 PO-2024-1881 履约达成进度' }),
    ).toHaveAttribute('aria-valuenow', '82');
  });

  it('保留设计稿列顺序、压缩宽度且不启用固定列', () => {
    render(<TableDemo />);
    const props = getTableProps();

    expect(props.rowSelection?.fixed).toBeUndefined();
    expect(props.columns?.every((column) => !column.fixed)).toBe(true);
    expect(props.columns?.map((column) => column.key)).toEqual([
      'id',
      'vendor',
      'amount',
      'fulfillment',
      'status',
      'actions',
    ]);
    expect(props.columns?.find((column) => column.key === 'vendor')?.width).toBe(154);
    expect(props.columns?.find((column) => column.key === 'fulfillment')?.width).toBe(144);
    expect(props.columns?.find((column) => column.key === 'status')?.width).toBe(100);
    expect(Number(props.scroll?.x)).toBe(856);
    expect(props.style?.minInlineSize).toBe(856);
    const vendorCells = screen.getAllByText('上海深蓝光电高新材料有限公司');
    expect(vendorCells).toHaveLength(2);
    expect(vendorCells.map((cell) => cell.getAttribute('title'))).toEqual([
      '上海深蓝光电高新材料有限公司',
      '上海深蓝光电高新材料有限公司',
    ]);
  });

  it('使用单一可聚焦滚动区，宽屏布局也不设置固定列', () => {
    render(<TableDemo />);
    const props = getTableProps();
    expect(props.rowSelection?.fixed).toBeUndefined();
    expect(props.columns?.some((column) => column.fixed)).toBe(false);
    expect(props.scroll?.x).toBe(856);

    const scrollRegion = screen.getByRole('region', { name: '采购订单表格' });
    expect(scrollRegion).toHaveAttribute('tabindex', '0');
    scrollRegion.focus();
    expect(scrollRegion).toHaveFocus();
    const rowSelection = screen.getByRole('checkbox', { name: '选择采购单 PO-2024-1881' });
    const childKeyEvent = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    });
    fireEvent(rowSelection, childKeyEvent);
    expect(childKeyEvent.defaultPrevented).toBe(false);
    expect(scrollRegion.scrollLeft).toBe(0);

    fireEvent.keyDown(scrollRegion, { key: 'ArrowRight' });
    expect(scrollRegion.scrollLeft).toBe(80);
    fireEvent.keyDown(scrollRegion, { key: 'ArrowLeft' });
    expect(scrollRegion.scrollLeft).toBe(0);
  });
});
