import { createRef } from 'react';
import { ConfigProvider } from 'antd';
import { fireEvent, render, screen } from '@testing-library/react';
import { Badge, type RibbonProps } from '..';
import { describe, expect, it, vi } from 'vitest';
describe('Badge', () => {
  it('exposes the AntD Ribbon API with its public prop type', () => {
    const props: RibbonProps = {
      text: 'SLA VIP 认证',
      color: 'var(--lx-color-primary)',
      placement: 'end',
    };

    const { container } = render(
      <Badge.Ribbon {...props} className="public-ribbon" rootClassName="public-ribbon-root">
        <span>重点客户服务</span>
      </Badge.Ribbon>,
    );

    expect(screen.getByText('SLA VIP 认证')).toBeInTheDocument();
    expect(screen.getByText('重点客户服务')).toBeInTheDocument();
    expect(container.querySelector('.public-ribbon')).toBeInTheDocument();
    expect(container.querySelector('.public-ribbon-root')).toBeInTheDocument();
  });

  it('adds default diagonal styling while allowing host class and style overrides', () => {
    const { container } = render(
      <Badge.Ribbon
        className="host-ribbon"
        rootClassName="host-ribbon-root"
        style={{ transform: 'rotate(0deg)', width: 80 }}
        text="VIP"
      >
        <span>内容</span>
      </Badge.Ribbon>,
    );
    const ribbon = container.querySelector<HTMLElement>('.host-ribbon');

    expect(ribbon).toHaveClass('host-ribbon');
    expect(ribbon?.style.transform).toBe('rotate(0deg)');
    expect(ribbon?.style.width).toBe('80px');
    const ribbonRoot = container.querySelector<HTMLElement>('.host-ribbon-root');
    expect(ribbonRoot).toHaveClass('host-ribbon-root');
  });

  it('keeps an explicit Ribbon color solid and honors style background overrides', () => {
    const { container, rerender } = render(
      <Badge.Ribbon className="colored-ribbon" color="#1677ff" text="纯色" />,
    );
    const coloredRibbon = container.querySelector<HTMLElement>('.colored-ribbon');
    expect(coloredRibbon?.style.backgroundImage).toBe('');
    expect(coloredRibbon?.style.background).toContain('rgb(22, 119, 255)');

    rerender(
      <Badge.Ribbon
        className="colored-ribbon"
        color="#1677ff"
        style={{ backgroundImage: 'none', color: '#123456' }}
        text="自定义"
      />,
    );
    expect(coloredRibbon?.style.backgroundImage).toBe('none');
    expect(coloredRibbon?.style.color).toBe('rgb(18, 52, 86)');

    rerender(
      <Badge.Ribbon
        className="colored-ribbon"
        style={{ backgroundColor: '#f0f0f0' }}
        text="背景色"
      />,
    );
    expect(coloredRibbon?.style.backgroundImage).toBe('');
    expect(coloredRibbon?.style.backgroundColor).toBe('rgb(240, 240, 240)');
  });

  it('places start ribbons on the logical start edge', () => {
    const { container } = render(
      <Badge.Ribbon className="start-ribbon" placement="start" text="起始侧" />,
    );
    const ribbon = container.querySelector<HTMLElement>('.start-ribbon');

    expect(ribbon?.style.insetInlineStart).toContain('--lx-badge-ribbon-inline-offset');
    expect(ribbon?.style.insetInlineEnd).toBe('auto');
  });

  it('shows overflow count', () => {
    const { rerender } = render(<Badge count={120} overflowCount={99} />);
    expect(screen.getByText('99+')).toBeInTheDocument();
    rerender(<Badge count={1200} overflowCount={999} />);
    expect(screen.getByText('999+')).toBeInTheDocument();
  });
  it('preserves status, dot, title, and child accessibility semantics', () => {
    const { rerender } = render(
      <Badge status="success" title="已完成">
        <button>订单</button>
      </Badge>,
    );
    expect(screen.getByRole('button', { name: '订单' })).toBeInTheDocument();
    rerender(<Badge dot data-testid="dot" />);
    expect(screen.getByTestId('dot')).toBeInTheDocument();
  });

  it('keeps status-only Badge non-interactive and documents the AntD ref boundary', () => {
    const ref = createRef<HTMLSpanElement>();
    const onClick = vi.fn();
    render(
      <Badge
        ref={ref}
        status="success"
        text="已完成"
        className="host-class"
        data-testid="status-only-badge"
        style={{ marginInlineStart: 4 }}
        onClick={onClick}
      />,
    );
    const badge = screen.getByTestId('status-only-badge');
    expect(badge).toHaveClass('host-class');
    expect(badge).toHaveStyle({ marginInlineStart: '4px' });
    expect(badge).not.toHaveAttribute('role');
    expect(ref.current).toBeNull();
    fireEvent.click(badge as HTMLElement);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('adds the processing hook while preserving a host indicator class', () => {
    const { container } = render(
      <Badge status="processing" text="同步中" classNames={{ indicator: 'host-indicator' }} />,
    );
    const indicator = container.querySelector('.host-indicator');
    expect(indicator).toHaveClass('host-indicator');
  });

  it('retains the processing color when the host supplies one', () => {
    const { container } = render(
      <Badge
        status="processing"
        color="#7c3aed"
        text="处理中"
        classNames={{ indicator: 'host-indicator' }}
      />,
    );
    const indicator = container.querySelector<HTMLElement>('.host-indicator');
    expect(indicator).toHaveStyle({ color: '#7c3aed', background: '#7c3aed' });
  });

  it('preserves AntD preset colors on processing indicators', () => {
    const { container } = render(
      <Badge
        status="processing"
        color="blue"
        text="处理中"
        classNames={{ indicator: 'host-indicator' }}
      />,
    );
    const indicator = container.querySelector<HTMLElement>('.host-indicator');

    expect(indicator).toBeInTheDocument();
    expect(window.getComputedStyle(indicator as HTMLElement).backgroundColor).toBe(
      'rgb(22, 119, 255)',
    );
  });

  it('preserves public indicator color styles supplied by the host', () => {
    const { container } = render(
      <Badge
        status="processing"
        text="处理中"
        classNames={{ indicator: 'host-indicator' }}
        styles={{ indicator: { color: '#7c3aed', background: '#d8b4fe' } }}
      />,
    );
    const indicator = container.querySelector('.host-indicator');
    expect(indicator).toHaveStyle({ color: '#7c3aed', background: '#d8b4fe' });
  });

  it('uses the host indicator color as the processing fill when no background is set', () => {
    const { container } = render(
      <Badge
        status="processing"
        text="处理中"
        classNames={{ indicator: 'host-indicator' }}
        styles={{ indicator: { color: '#7c3aed' } }}
      />,
    );
    const indicator = container.querySelector<HTMLElement>('.host-indicator');

    expect(indicator?.style.color).toBe('rgb(124, 58, 237)');
    expect(indicator?.style.backgroundColor).toBe('currentcolor');
  });

  it('preserves the indicator backgroundColor style supplied by the host', () => {
    const { container } = render(
      <Badge
        status="processing"
        text="处理中"
        classNames={{ indicator: 'host-indicator' }}
        styles={{ indicator: { backgroundColor: '#d8b4fe' } }}
      />,
    );
    const indicator = container.querySelector('.host-indicator');
    expect(indicator).toHaveStyle({ backgroundColor: '#d8b4fe' });
  });

  it.each(['linear-gradient(90deg, #7c3aed, transparent)', 'none'])(
    'preserves the host indicator backgroundImage style %s with a transparent base',
    (backgroundImage) => {
      const { container } = render(
        <Badge
          status="processing"
          text="处理中"
          classNames={{ indicator: 'host-indicator' }}
          styles={{ indicator: { backgroundImage } }}
        />,
      );
      const indicator = container.querySelector<HTMLElement>('.host-indicator');

      expect(indicator?.style.backgroundImage).toBe(backgroundImage);
      expect(indicator?.style.backgroundColor).toBe('transparent');
    },
  );

  it('allows AntD ConfigProvider badge styles to override the processing color', () => {
    const { container } = render(
      <ConfigProvider
        badge={{ styles: { indicator: { color: '#7c3aed', backgroundColor: '#d8b4fe' } } }}
      >
        <Badge status="processing" text="处理中" classNames={{ indicator: 'host-indicator' }} />
      </ConfigProvider>,
    );
    const indicator = container.querySelector('.host-indicator');
    expect(indicator).toHaveStyle({ color: '#7c3aed', backgroundColor: '#d8b4fe' });
  });

  it('allows ConfigProvider to layer an image on a transparent processing indicator', () => {
    const { container } = render(
      <ConfigProvider
        badge={{
          styles: {
            indicator: {
              backgroundColor: 'transparent',
              backgroundImage: 'linear-gradient(90deg, #7c3aed, transparent)',
            },
          },
        }}
      >
        <Badge status="processing" text="处理中" classNames={{ indicator: 'host-indicator' }} />
      </ConfigProvider>,
    );
    const indicator = container.querySelector<HTMLElement>('.host-indicator');

    expect(indicator?.style.backgroundColor).toBe('transparent');
    expect(indicator?.style.backgroundImage).toContain('linear-gradient');
  });

  it('uses the ConfigProvider indicator color as the processing fill when no background is set', () => {
    const { container } = render(
      <ConfigProvider badge={{ styles: { indicator: { color: '#7c3aed' } } }}>
        <Badge status="processing" text="处理中" classNames={{ indicator: 'host-indicator' }} />
      </ConfigProvider>,
    );
    const indicator = container.querySelector<HTMLElement>('.host-indicator');

    expect(indicator?.style.color).toBe('rgb(124, 58, 237)');
    expect(indicator?.style.backgroundColor).toBe('currentcolor');
  });

  it('does not apply status-dot motion to an attached numeric count', () => {
    const { container } = render(
      <Badge status="processing" count={8} classNames={{ indicator: 'host-indicator' }}>
        <span>头像</span>
      </Badge>,
    );
    const indicator = container.querySelector<HTMLElement>('.host-indicator');
    expect(indicator).toHaveTextContent('8');
    expect(indicator?.className).not.toContain('processingIndicator');
  });

  it('does not apply status-dot motion when the processing Badge has children', () => {
    const { container } = render(
      <Badge status="processing" text="同步中" classNames={{ indicator: 'host-indicator' }}>
        <span>头像</span>
      </Badge>,
    );
    const indicator = container.querySelector<HTMLElement>('.host-indicator');
    expect(indicator).toBeInTheDocument();
    expect(indicator?.className).not.toContain('processingIndicator');
  });

  it('forwards ref to the root when children are present', () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <Badge ref={ref} count={8} data-testid="badge-root">
        <span>头像</span>
      </Badge>,
    );
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current).toBe(screen.getByTestId('badge-root'));
  });
});
