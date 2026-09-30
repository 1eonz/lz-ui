import { act } from 'react';
import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Tree, type DataNode, type TreeDataNode, type TreeProps, type TreeRef } from '..';

const nodes: DataNode[] = [
  { key: 'customers', title: '客户', children: [{ key: 'vip', title: '重点客户' }] },
  { key: 'async', title: '异步节点', isLeaf: false },
];

describe('Tree', () => {
  it('preserves custom node metadata in generic render and load callbacks', () => {
    type CustomerNode = TreeDataNode & { customerId: string; segment: 'vip' | 'standard' };
    const customerNodes: CustomerNode[] = [
      {
        key: 'customer-1',
        title: '客户一',
        customerId: 'C-001',
        segment: 'vip',
        isLeaf: false,
      },
    ];
    const loadData: NonNullable<TreeProps<CustomerNode>['loadData']> = vi.fn((node) => {
      expect(node.customerId).toBe('C-001');
      return new Promise<void>(() => undefined);
    });

    render(
      <Tree<CustomerNode>
        treeData={customerNodes}
        titleRender={(node) => `${node.customerId} · ${node.segment}`}
        loadData={loadData}
      />,
    );

    expect(screen.getByText('C-001 · vip')).toBeInTheDocument();
    act(() => {
      fireEvent.click(screen.getByLabelText('caret-down'));
    });
    expect(loadData).toHaveBeenCalledWith(expect.objectContaining({ customerId: 'C-001' }));
  });

  it('renders the supplied node hierarchy', () => {
    render(<Tree treeData={nodes} defaultExpandAll />);
    expect(screen.getByText('客户')).toBeInTheDocument();
    expect(screen.getByText('重点客户')).toBeInTheDocument();
  });

  it('forwards controlled expand, select and check callbacks', () => {
    const onExpand = vi.fn();
    const onSelect = vi.fn();
    const onCheck = vi.fn();
    render(
      <Tree
        treeData={nodes}
        expandedKeys={[]}
        selectedKeys={[]}
        checkedKeys={[]}
        checkable
        onExpand={onExpand}
        onSelect={onSelect}
        onCheck={onCheck}
      />,
    );

    fireEvent.click(screen.getAllByLabelText('caret-down')[0]);
    expect(onExpand).toHaveBeenCalledWith(['customers'], expect.any(Object));
    fireEvent.click(screen.getByText('客户'));
    expect(onSelect).toHaveBeenCalledWith(['customers'], expect.any(Object));
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    expect(onCheck).toHaveBeenCalledWith(['customers', 'vip'], expect.any(Object));
  });

  it('forwards async loadData and load notifications', async () => {
    const onLoad = vi.fn();
    const loadData = vi.fn(() => Promise.resolve());
    render(<Tree treeData={nodes} loadData={loadData} onLoad={onLoad} />);

    fireEvent.click(screen.getAllByLabelText('caret-down')[1]);
    expect(loadData).toHaveBeenCalledWith(expect.objectContaining({ key: 'async' }));
    await screen.findByText('异步节点');
    expect(onLoad).toHaveBeenCalled();
  });

  it('forwards ref and className to the AntD root without a wrapper', () => {
    const ref = createRef<TreeRef>();
    const { container } = render(<Tree ref={ref} className="custom-tree" treeData={nodes} />);
    expect(ref.current).toBeTruthy();
    expect(container.firstElementChild).toHaveClass('custom-tree');
    expect(container.firstElementChild?.parentElement).toBe(container);
  });

  it('forwards virtual and height options', () => {
    render(<Tree treeData={nodes} virtual height={240} />);
    expect(screen.getByRole('tree')).toBeInTheDocument();
  });
});
