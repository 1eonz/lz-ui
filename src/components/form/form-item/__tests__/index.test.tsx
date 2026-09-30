import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Form } from 'antd';
import { describe, expect, it, vi } from 'vitest';
import { Input } from '../../input';
import { FormItem } from '../index';

describe('FormItem', () => {
  it('associates its label and forwards input values to form submit', async () => {
    const onFinish = vi.fn();
    render(
      <Form onFinish={onFinish}>
        <FormItem label="姓名" name="name" rules={[{ required: true, message: '请输入姓名' }]}>
          <Input />
        </FormItem>
        <button type="submit">提交</button>
      </Form>,
    );
    fireEvent.change(screen.getByRole('textbox', { name: '姓名' }), { target: { value: 'Lin' } });
    fireEvent.click(screen.getByRole('button', { name: '提交' }));
    await waitFor(() => expect(onFinish).toHaveBeenCalledWith({ name: 'Lin' }));
  });

  it('shows validation feedback near the field', async () => {
    render(
      <Form>
        <FormItem label="姓名" name="name" rules={[{ required: true, message: '请输入姓名' }]}>
          <Input />
        </FormItem>
        <button type="submit">提交</button>
      </Form>,
    );
    fireEvent.click(screen.getByRole('button', { name: '提交' }));
    await waitFor(() => expect(screen.getByText('请输入姓名')).toBeInTheDocument());
  });
});
