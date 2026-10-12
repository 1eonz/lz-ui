import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Skeleton } from '../index';

describe('Skeleton accessibility', () => {
  it('exposes a busy status while loading', () => {
    render(<Skeleton aria-label="数据加载中" />);
    expect(screen.getByRole('status', { name: '数据加载中' })).toHaveAttribute('aria-busy', 'true');
  });

  it('removes loading metadata when completed content is rendered', () => {
    const ref = createRef<HTMLDivElement>();
    const descriptionId = 'skeleton-loading-description';
    const { rerender } = render(
      <>
        <p id={descriptionId}>正在读取采购记录</p>
        <Skeleton ref={ref} aria-label="采购记录加载中" aria-describedby={descriptionId}>
          <span>采购记录已就绪</span>
        </Skeleton>
      </>,
    );

    expect(ref.current).toHaveAttribute('role', 'status');
    expect(ref.current).toHaveAttribute('aria-busy', 'true');
    expect(ref.current).toHaveAttribute('aria-label', '采购记录加载中');
    expect(ref.current).toHaveAttribute('aria-describedby', descriptionId);

    rerender(
      <>
        <p id={descriptionId}>正在读取采购记录</p>
        <Skeleton
          ref={ref}
          loading={false}
          aria-label="采购记录加载中"
          aria-describedby={descriptionId}
        >
          <span>采购记录已就绪</span>
        </Skeleton>
      </>,
    );

    expect(screen.getByText('采购记录已就绪')).toBeInTheDocument();
    expect(ref.current).not.toHaveAttribute('role');
    expect(ref.current).not.toHaveAttribute('aria-busy');
    expect(ref.current).not.toHaveAttribute('aria-label');
    expect(ref.current).not.toHaveAttribute('aria-describedby');
  });
});
