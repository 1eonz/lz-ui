import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Link, Paragraph, Text, Title } from '../index';

describe('Typography', () => {
  it('renders native semantic elements and disabled links', () => {
    const { container } = render(
      <>
        <Title level={3}>标题</Title>
        <Paragraph>正文</Paragraph>
        <Link href="/a" disabled>
          链接
        </Link>
      </>,
    );
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    expect(container.querySelector('p')).toHaveTextContent('正文');
    expect(screen.getByText('链接').closest('a')).not.toHaveAttribute('href');
  });

  it('copies through a labelled keyboard button and announces completion', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    render(<Text copyable>KH-1024</Text>);
    fireEvent.click(screen.getByRole('button', { name: '复制KH-1024' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('KH-1024'));
    expect(await screen.findByRole('status')).toHaveTextContent('复制成功');
  });

  it('supports multi-line truncation without changing text content', () => {
    render(<Paragraph ellipsis={{ rows: 2 }}>很长的正文</Paragraph>);
    expect(screen.getByText('很长的正文')).toHaveTextContent('很长的正文');
  });

  it.each([true, { rows: 2 }])(
    'keeps copy controls outside the ellipsis clipping layer',
    (ellipsis) => {
      const { container } = render(
        <Text ellipsis={ellipsis} copyable>
          Long copy text
        </Text>,
      );
      const button = screen.getByRole('button', { name: '复制Long copy text' });
      expect(button.parentElement).not.toHaveClass(ellipsis === false ? 'singleLine' : 'multiLine');
      expect(
        container.querySelector(
          ellipsis === true ? '[class*="singleLine"]' : '[class*="multiLine"]',
        ),
      ).toHaveTextContent('Long copy text');
    },
  );

  it('ignores stale clipboard completions after text changes', async () => {
    let resolveOld!: () => void;
    const writeText = vi.fn((text: string) =>
      text === 'old'
        ? new Promise<void>((resolve) => {
            resolveOld = resolve;
          })
        : Promise.resolve(),
    );
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    const { rerender } = render(<Text copyable>old</Text>);
    fireEvent.click(screen.getByRole('button', { name: '复制old' }));
    rerender(<Text copyable>new</Text>);
    resolveOld();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '复制new' })).toBeInTheDocument(),
    );
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('ignores a clipboard completion after copyable is disabled', async () => {
    let resolveWrite!: () => void;
    const writeText = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveWrite = resolve;
        }),
    );
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    const onCopy = vi.fn();
    const { rerender } = render(<Text copyable={{ onCopy }}>same</Text>);
    fireEvent.click(screen.getByRole('button', { name: '复制same' }));
    rerender(<Text>same</Text>);
    resolveWrite();
    await waitFor(() => expect(screen.queryByRole('button')).not.toBeInTheDocument());
    expect(onCopy).not.toHaveBeenCalled();
  });

  it('keeps clipboard success when onCopy throws and announces repeated copies', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    const onCopy = vi.fn(() => {
      throw new Error('consumer callback');
    });
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(<Text copyable={{ onCopy }}>copy</Text>);
    const button = screen.getByRole('button', { name: '复制copy' });
    fireEvent.click(button);
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('复制成功'));
    fireEvent.click(screen.getByRole('button', { name: '已复制' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('2'));
    expect(onCopy).toHaveBeenCalledTimes(2);
    expect(error).toHaveBeenCalledTimes(2);
    error.mockRestore();
  });

  it('retains semantic link colors over the default link color', () => {
    render(
      <Link type="success" href="/done">
        完成
      </Link>,
    );
    expect(screen.getByRole('link', { name: '完成' }).className).toContain('linkSemantic');
  });
});
