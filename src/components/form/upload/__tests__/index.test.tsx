import { act, fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Upload } from '../index';

describe('Upload', () => {
  it('keeps the native picker local when no transport is supplied', async () => {
    render(
      <Upload>
        <button type="button">选择文件</button>
      </Upload>,
    );
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
      await Promise.resolve();
    });
    expect(document.querySelector('[action]')).not.toBeInTheDocument();
  });
  it('supports disabled state', () => {
    render(
      <Upload disabled>
        <button type="button">选择</button>
      </Upload>,
    );
    expect(document.querySelector('input[type="file"]')).toBeDisabled();
  });
});
