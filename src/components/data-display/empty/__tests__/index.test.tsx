import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import { Button } from '../../../general/button';
import { LxConfigProvider } from '../../../../theme/provider';
import { Empty } from '../index';

describe('Empty', () => {
  it('renders description and the explicit action', () => {
    render(<Empty description="暂无记录" action={<Button>新建</Button>} />);
    expect(screen.getByText('暂无记录')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '新建' })).toBeInTheDocument();
  });

  it('supports compact variant and custom image', () => {
    const { container } = render(
      <Empty
        variant="small"
        image={<span data-testid="custom-empty-image">图示</span>}
        classNames={{ image: 'custom-empty-image-slot' }}
        imageStyle={{ height: '28px' }}
      />,
    );
    expect(container.querySelector('[data-lx-empty-variant="small"]')).toBeTruthy();
    expect(screen.getByText('图示')).toBeInTheDocument();
    expect(screen.getByTestId('custom-empty-image')).toBeInTheDocument();
    expect(container.querySelector('.custom-empty-image-slot')).toHaveStyle({ height: '28px' });
  });

  it('preserves the image configured by the outer AntD provider', () => {
    render(
      <ConfigProvider empty={{ image: <span>Provider image</span> }}>
        <LxConfigProvider>
          <Empty description="No records" />
        </LxConfigProvider>
      </ConfigProvider>,
    );

    expect(screen.getByText('Provider image')).toBeInTheDocument();
  });
});
