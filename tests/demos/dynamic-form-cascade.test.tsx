import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import DynamicFormCascadeDemo from '../../docs/demos/dynamic-form-cascade';

vi.mock('../../docs/demos/data-display-demo-frame', () => ({
  DataDisplayDemoFrame: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

async function advanceDemoOptions(milliseconds: number): Promise<void> {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(milliseconds);
  });
}

describe('DynamicForm 级联示例', () => {
  it('相同状态文案再次播报前清空 live region', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      render(<DynamicFormCascadeDemo />);
      const reset = screen.getByRole('button', { name: '重置' });
      const message = '表单已重置，区域恢复为华东。';

      fireEvent.click(reset);
      expect(screen.queryByText(message)).not.toBeInTheDocument();
      act(() => vi.advanceTimersByTime(50));
      const firstAnnouncement = screen.getByText(message);
      expect(firstAnnouncement).toHaveAttribute('role', 'status');
      expect(firstAnnouncement).toHaveAttribute('aria-live', 'polite');

      fireEvent.click(reset);
      expect(screen.queryByText(message)).not.toBeInTheDocument();
      act(() => vi.advanceTimersByTime(50));
      const repeatedAnnouncement = screen.getByText(message);
      expect(repeatedAnnouncement).toHaveAttribute('role', 'status');
      expect(repeatedAnnouncement).toHaveAttribute('aria-live', 'polite');
    } finally {
      vi.useRealTimers();
    }
  });

  it('切换区域但没有已选子项时不播报清除结果', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      render(<DynamicFormCascadeDemo />);
      fireEvent.mouseDown(screen.getByRole('combobox', { name: '区域' }));
      fireEvent.click(screen.getByText('华南'));
      act(() => vi.advanceTimersByTime(50));

      expect(screen.getByText('区域已更改。')).toBeInTheDocument();
      expect(screen.queryByText(/已清除/)).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('没有城市时禁用区县并向控件说明选择顺序', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      render(<DynamicFormCascadeDemo />);
      const district = screen.getByRole('combobox', { name: '区县' });
      expect(district).toBeDisabled();
      expect(district).toHaveAccessibleDescription(/^先选择城市，再搜索对应区县。\s*$/);

      fireEvent.mouseDown(district);
      fireEvent.change(district, { target: { value: '区' } });
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

      const city = screen.getByRole('combobox', { name: '城市' });
      fireEvent.mouseDown(city);
      fireEvent.change(city, { target: { value: '市' } });
      await advanceDemoOptions(380);
      fireEvent.click(screen.getByText('杭州市'));
      act(() => vi.advanceTimersByTime(50));

      expect(screen.getByText('城市已更改。')).toBeInTheDocument();
      expect(screen.queryByText(/已清除区县/)).not.toBeInTheDocument();
      expect(district).not.toBeDisabled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('更改区域后清除已选城市和区县，并刷新城市候选', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      render(<DynamicFormCascadeDemo />);

      const region = screen.getByRole('combobox', { name: '区域' });
      const city = screen.getByRole('combobox', { name: '城市' });
      fireEvent.mouseDown(city);
      fireEvent.change(city, { target: { value: '市' } });
      await advanceDemoOptions(380);
      fireEvent.click(screen.getByText('杭州市'));
      act(() => vi.advanceTimersByTime(50));

      const district = screen.getByRole('combobox', { name: '区县' });
      fireEvent.mouseDown(district);
      fireEvent.change(district, { target: { value: '区' } });
      await advanceDemoOptions(380);
      fireEvent.click(screen.getByText('西湖区'));
      act(() => vi.advanceTimersByTime(50));

      fireEvent.mouseDown(region);
      fireEvent.click(screen.getByText('华南'));
      await advanceDemoOptions(380);

      const currentValueDisplay = screen.getByRole('figure', { name: '当前表单值' });
      const currentValues = JSON.parse(
        currentValueDisplay.querySelector('pre')?.textContent ?? '{}',
      ) as { location?: Record<string, unknown> };
      expect(currentValues.location).toEqual({ region: 'south' });
      expect(screen.getByText('区域已更改，已清除城市和区县。')).toBeInTheDocument();

      fireEvent.mouseDown(city);
      await advanceDemoOptions(380);
      expect(screen.getByText('深圳市')).toBeInTheDocument();
      expect(screen.queryByText('杭州市')).not.toBeInTheDocument();
      const refreshedValueDisplay = screen.getByRole('figure', { name: '当前表单值' });
      const refreshedValues = JSON.parse(
        refreshedValueDisplay.querySelector('pre')?.textContent ?? '{}',
      ) as { location?: Record<string, unknown> };
      expect(refreshedValues.location?.region).toBe('south');
    } finally {
      vi.useRealTimers();
    }
  }, 30_000);
});
