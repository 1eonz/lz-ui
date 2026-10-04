import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import InputAffixesDemo from '../../docs/demos/input-affixes';
import InputBasicDemo from '../../docs/demos/input-basic';
import InputTextAreaDemo from '../../docs/demos/input-textarea';

vi.mock('../../docs/demos/data-display-demo-frame', () => ({
  DataDisplayDemoFrame: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('Input 文档示例', () => {
  it('基础输入清除按钮提供字段名称并清空受控值', () => {
    render(<InputBasicDemo />);

    fireEvent.click(screen.getByRole('button', { name: '清除客户名称' }));

    expect(screen.getByRole('status')).toHaveTextContent('未填写');
  });

  it('TextArea 清除按钮提供字段名称并更新字数', () => {
    render(<InputTextAreaDemo />);

    fireEvent.click(screen.getByRole('button', { name: '清除采购备注' }));

    expect(screen.getByRole('status')).toHaveTextContent('已填写 0 字');
  });

  it('前后缀示例清除按钮提供字段名称并清空简称', () => {
    render(<InputAffixesDemo />);

    fireEvent.click(screen.getByRole('button', { name: '清除合同简称' }));

    expect(screen.getByLabelText('合同简称')).toHaveValue('');
  });
});
