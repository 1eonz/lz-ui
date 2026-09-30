import { createRef, StrictMode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Pagination } from '..';

describe('Pagination', () => {
  it('supports controlled current/pageSize and onChange', () => {
    const onChange = vi.fn();
    render(<Pagination current={2} pageSize={10} total={50} onChange={onChange} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
    fireEvent.click(screen.getByTitle('Previous Page'));
    expect(onChange).toHaveBeenCalledWith(1, 10);
  });

  it('supports non-controlled defaults', () => {
    render(<Pagination defaultCurrent={2} defaultPageSize={10} total={50} />);
    expect(screen.getByRole('list').querySelector('.ant-pagination-item-2')).toHaveClass(
      'ant-pagination-item-active',
    );
  });

  it('exposes the AntD root and preserves className', () => {
    const ref = createRef<HTMLUListElement>();
    render(<Pagination ref={ref} className="custom-pagination" total={30} />);
    expect(ref.current).toBe(screen.getByRole('list'));
    expect(ref.current).toHaveClass('custom-pagination');
  });

  it('attaches and detaches callback refs, including StrictMode remounts', () => {
    const ref = vi.fn();
    const { unmount } = render(
      <StrictMode>
        <Pagination ref={ref} total={30} />
      </StrictMode>,
    );

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLUListElement));
    unmount();
    expect(ref).toHaveBeenLastCalledWith(null);
  });

  it('keeps marker refs isolated for multiple instances', () => {
    const first = createRef<HTMLUListElement>();
    const second = createRef<HTMLUListElement>();
    render(
      <>
        <Pagination ref={first} total={30} />
        <Pagination ref={second} total={30} />
      </>,
    );

    expect(first.current).not.toBe(second.current);
    expect(first.current).toBeInstanceOf(HTMLUListElement);
    expect(second.current).toBeInstanceOf(HTMLUListElement);
  });

  it('reattaches its ref when hideOnSinglePage recreates the root', () => {
    const ref = createRef<HTMLUListElement>();
    const { rerender } = render(<Pagination ref={ref} hideOnSinglePage total={5} />);
    expect(ref.current).toBeNull();
    rerender(<Pagination ref={ref} hideOnSinglePage total={30} />);
    expect(ref.current).toBe(screen.getByRole('list'));
    rerender(<Pagination ref={ref} hideOnSinglePage total={5} />);
    expect(ref.current).toBeNull();
    rerender(<Pagination ref={ref} hideOnSinglePage total={40} />);
    expect(ref.current).toBe(screen.getByRole('list'));
  });

  it('does not repeatedly notify stable callback refs for an unchanged root', () => {
    const ref = vi.fn();
    const { rerender } = render(<Pagination ref={ref} total={30} />);
    expect(ref).toHaveBeenCalledTimes(1);
    rerender(<Pagination ref={ref} total={40} />);
    expect(ref).toHaveBeenCalledTimes(1);
  });

  it('detaches the previous callback when the ref itself changes', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = render(<Pagination ref={first} total={30} />);
    const root = screen.getByRole('list');
    rerender(<Pagination ref={second} total={30} />);
    expect(first).toHaveBeenLastCalledWith(null);
    expect(second).toHaveBeenLastCalledWith(root);
  });

  it('detaches when an uncontrolled page-size change hides the native root', async () => {
    const ref = createRef<HTMLUListElement>();
    const onChange = vi.fn();
    render(
      <Pagination
        ref={ref}
        defaultPageSize={10}
        total={30}
        showSizeChanger
        hideOnSinglePage
        onChange={onChange}
      />,
    );
    expect(ref.current).toBe(screen.getByRole('list'));
    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(await screen.findByTitle('50 / page'));
    await waitFor(() => expect(screen.queryByRole('list')).not.toBeInTheDocument());
    expect(ref.current).toBeNull();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(1, 50);
  });

  it('synchronizes uncontrolled hiding without requiring a host onChange', async () => {
    const ref = createRef<HTMLUListElement>();
    render(
      <Pagination ref={ref} defaultPageSize={10} total={30} showSizeChanger hideOnSinglePage />,
    );
    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(await screen.findByTitle('50 / page'));
    await waitFor(() => expect(ref.current).toBeNull());
  });

  it('supports disabled and simple semantics', () => {
    render(<Pagination disabled simple total={30} />);
    expect(screen.getByRole('list')).toHaveClass('ant-pagination-simple');
    expect(screen.getByTitle('Previous Page').querySelector('button')).toBeDisabled();
  });
});
