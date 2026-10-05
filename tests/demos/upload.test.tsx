import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ControlledUploadDemo from '../../docs/demos/form-doc-upload-controlled';
import UploadLimitDemo from '../../docs/demos/form-doc-upload-limit';
import { Upload } from '../../src/components/form/upload';

vi.mock('lx-ui', async () => {
  const [{ Button }, { Upload }] = await Promise.all([
    import('../../src/components/general/button'),
    import('../../src/components/form/upload'),
  ]);

  return { Button, Upload };
});

vi.mock('lx-ui/antd', async () => {
  const { Upload } = await import('antd');
  return { Upload };
});

vi.mock('../../docs/demos/data-display-demo-frame', () => ({
  DataDisplayDemoFrame: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Upload 文档示例', () => {
  it('受控列表添加文件后可通过移除按钮更新列表', async () => {
    const { container } = render(<ControlledUploadDemo />);
    const input = container.querySelector<HTMLInputElement>('input[type="file"]');
    expect(input).not.toBeNull();

    const file = new File(['attachment'], 'attachment.txt', { type: 'text/plain' });
    await act(async () => {
      fireEvent.change(input as HTMLInputElement, { target: { files: [file] } });
    });

    expect(await screen.findByText(file.name)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('已选择 1 个文件');

    fireEvent.click(screen.getByRole('button', { name: 'delete' }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('已选择 0 个文件');
      expect(screen.queryByText(file.name)).not.toBeInTheDocument();
    });
  });

  it('限制示例不将类型不合格文件加入列表', async () => {
    const { container } = render(<UploadLimitDemo />);
    const input = container.querySelector<HTMLInputElement>('input[type="file"]');
    expect(input).not.toBeNull();

    const invalidFile = new File(['notes'], 'notes.txt', { type: 'text/plain' });
    await act(async () => {
      fireEvent.change(input as HTMLInputElement, { target: { files: [invalidFile] } });
    });

    expect(screen.getByRole('status')).toHaveTextContent('notes.txt 不符合PDF或大小要求');
    expect(screen.queryByText(invalidFile.name, { exact: true })).not.toBeInTheDocument();
  });

  it('限制示例保留合格 PDF 在本地且不发起 XMLHttpRequest', async () => {
    const send = vi.spyOn(XMLHttpRequest.prototype, 'send');
    const { container } = render(<UploadLimitDemo />);
    const input = container.querySelector<HTMLInputElement>('input[type="file"]');
    expect(input).not.toBeNull();

    const validFile = new File(['%PDF-1.7'], 'report.pdf', { type: 'application/pdf' });
    await act(async () => {
      fireEvent.change(input as HTMLInputElement, { target: { files: [validFile] } });
    });

    expect(screen.getByRole('status')).toHaveTextContent('report.pdf 已保留在本地');
    expect(await screen.findByText(validFile.name)).toBeInTheDocument();
    expect(screen.queryByText(/uploading/i)).not.toBeInTheDocument();
    expect(send).not.toHaveBeenCalled();
  });

  it('限制示例最多将前两份合格 PDF 加入列表', async () => {
    const { container } = render(<UploadLimitDemo />);
    const input = container.querySelector<HTMLInputElement>('input[type="file"]');
    expect(input).not.toBeNull();

    const files = [1, 2, 3].map(
      (index) =>
        new File([`%PDF-1.7 ${index}`], `report-${index}.pdf`, { type: 'application/pdf' }),
    );
    await act(async () => {
      fireEvent.change(input as HTMLInputElement, { target: { files } });
    });

    await waitFor(() => {
      expect(screen.getByText(files[0].name)).toBeInTheDocument();
      expect(screen.getByText(files[1].name)).toBeInTheDocument();
      expect(screen.queryByText(files[2].name, { exact: true })).not.toBeInTheDocument();
    });
  });

  it('拒绝移除时保留本地文件', async () => {
    const onRemove = vi.fn(() => false);
    const { container } = render(
      <Upload onRemove={onRemove}>
        <button type="button">选择不可移除文件</button>
      </Upload>,
    );
    const input = container.querySelector<HTMLInputElement>('input[type="file"]');
    expect(input).not.toBeNull();

    const file = new File(['local'], 'keep.txt', { type: 'text/plain' });
    await act(async () => {
      fireEvent.change(input as HTMLInputElement, { target: { files: [file] } });
    });
    expect(await screen.findByText(file.name)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'delete' }));

    expect(onRemove).toHaveBeenCalledOnce();
    expect(screen.getByText(file.name)).toBeInTheDocument();
  });
});
