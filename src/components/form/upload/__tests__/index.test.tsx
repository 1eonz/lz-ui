import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Upload } from '../index';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Upload', () => {
  it('keeps the native picker local when no transport is supplied', async () => {
    const send = vi.spyOn(XMLHttpRequest.prototype, 'send');
    const statuses: (string | undefined)[] = [];
    const { container } = render(
      <Upload
        onChange={({ file, fileList }) => {
          statuses.push(file.status, ...fileList.map((item) => item.status));
        }}
      >
        <button type="button">选择本地文件</button>
      </Upload>,
    );
    const input = container.querySelector<HTMLInputElement>('input[type="file"]');
    expect(input).not.toBeNull();

    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
    await act(async () => {
      fireEvent.change(input as HTMLInputElement, { target: { files: [file] } });
    });

    expect(await screen.findByText(file.name)).toBeInTheDocument();
    expect(statuses).not.toContain('uploading');
    expect(screen.queryByText(/uploading/i)).not.toBeInTheDocument();
    expect(send).not.toHaveBeenCalled();
  });

  it('verifies a consumer-disabled trigger and the Upload-disabled input', () => {
    const { container } = render(
      <Upload disabled>
        <button disabled type="button">
          选择
        </button>
      </Upload>,
    );

    expect(screen.getByRole('button', { name: '选择' })).toBeDisabled();
    expect(container.querySelector('input[type="file"]')).toBeInTheDocument();
    expect(container.querySelector('input[type="file"]')).toBeDisabled();
  });
});
