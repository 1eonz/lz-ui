import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AlertInteractionDemo from '../../docs/demos/feedback-alert-interaction';

vi.mock('lx-ui', async () => {
  const [{ Alert }, { Button }] = await Promise.all([
    import('../../src/components/feedback/alert'),
    import('../../src/components/general/button'),
  ]);

  return { Alert, Button };
});

vi.mock('../../docs/demos/data-display-demo-frame', () => ({
  DataDisplayDemoFrame: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('Alert 交互文档示例', () => {
  it('通过 AntD closable 配置为关闭按钮提供可访问名称', () => {
    render(<AlertInteractionDemo />);

    expect(screen.getByRole('button', { name: '关闭' })).toBeInTheDocument();
  });
});
