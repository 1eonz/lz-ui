import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DemoRenderPage from '../../node_modules/dumi/dist/client/pages/Demo/index.js';

const mocks = vi.hoisted(() => ({
  useDemo: vi.fn(),
  useLiveDemo: vi.fn(),
  useRenderer: vi.fn(),
}));

vi.mock('dumi', async () => {
  const router = await import('react-router');
  return {
    useDemo: mocks.useDemo,
    useLiveDemo: mocks.useLiveDemo,
    useLocation: router.useLocation,
    useParams: router.useParams,
  };
});

vi.mock('../../node_modules/dumi/dist/client/pages/404.js', () => ({
  default: () => <div data-testid="dumi-not-found">Not found</div>,
}));

vi.mock('../../node_modules/dumi/dist/client/theme-api/useRenderer.js', () => ({
  useRenderer: mocks.useRenderer,
}));

function RouteControls() {
  const navigate = useNavigate();
  return (
    <nav aria-label="Demo route cases">
      <button onClick={() => navigate('/~demos/')}>Empty ID</button>
      <button
        onClick={() => navigate('/~demos/components/form/demo/?routeId=src%2Fcomponents%2Fform')}
      >
        Raw ID
      </button>
      <button
        onClick={() => navigate('/~demos/components%2Fform%2Fdemo?routeId=src%2Fcomponents%2Fform')}
      >
        Encoded ID
      </button>
      <button
        onClick={() =>
          navigate('/~demos/components/form/demo?routeId=src%2Fcomponents%2Fform%2Ffirst')
        }
      >
        First route ID
      </button>
      <button
        onClick={() =>
          navigate('/~demos/components/form/demo?routeId=src%2Fcomponents%2Fform%2Fsecond')
        }
      >
        Second route ID
      </button>
    </nav>
  );
}

function DemoRouteHarness() {
  return (
    <MemoryRouter initialEntries={['/~demos/']}>
      <RouteControls />
      <Routes>
        <Route path="/~demos/*" element={<DemoRenderPage />} />
        <Route path="*" element={<div>Outer 404</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Dumi standalone demo route patch', () => {
  beforeEach(() => {
    mocks.useDemo.mockReturnValue({
      component: () => <div>Demo content</div>,
      renderOpts: {},
    });
    mocks.useLiveDemo.mockReturnValue({
      node: null,
      setSource: vi.fn(),
      error: null,
      loading: false,
    });
    mocks.useRenderer.mockReturnValue({ canvasRef: { current: null } });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('uses the decoded multi-segment ID and routeId while removing a trailing slash', () => {
    render(
      <MemoryRouter
        initialEntries={['/~demos/components/form/demo/?routeId=src%2Fcomponents%2Fform']}
      >
        <Routes>
          <Route path="/~demos/*" element={<DemoRenderPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Demo content')).toBeInTheDocument();
    expect(mocks.useDemo).toHaveBeenCalledWith(
      'components/form/demo',
      undefined,
      undefined,
      'src/components/form',
    );
  });

  it('preserves a single-segment ID', () => {
    render(
      <MemoryRouter initialEntries={['/~demos/demo']}>
        <Routes>
          <Route path="/~demos/*" element={<DemoRenderPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Demo content')).toBeInTheDocument();
    expect(mocks.useDemo).toHaveBeenCalledWith('demo', undefined, undefined, undefined);
  });

  it('decodes encoded separators without changing query parsing', () => {
    render(
      <MemoryRouter
        initialEntries={['/~demos/components%2Fform%2Fdemo?routeId=src%2Fcomponents%2Fform']}
      >
        <Routes>
          <Route path="/~demos/*" element={<DemoRenderPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Demo content')).toBeInTheDocument();
    expect(mocks.useDemo).toHaveBeenCalledWith(
      'components/form/demo',
      undefined,
      undefined,
      'src/components/form',
    );
  });

  it('renders Dumi NotFound for an unknown non-empty ID', () => {
    mocks.useDemo.mockReturnValueOnce(undefined);

    render(
      <MemoryRouter initialEntries={['/~demos/missing-demo']}>
        <Routes>
          <Route path="/~demos/*" element={<DemoRenderPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('dumi-not-found')).toBeInTheDocument();
    expect(mocks.useDemo).toHaveBeenCalledWith('missing-demo', undefined, undefined, undefined);
    expect(mocks.useLiveDemo).not.toHaveBeenCalled();
  });

  it('reloads the demo when only routeId changes and keeps route hooks stable', () => {
    render(
      <MemoryRouter
        initialEntries={['/~demos/components/form/demo?routeId=src%2Fcomponents%2Fform%2Ffirst']}
      >
        <RouteControls />
        <Routes>
          <Route path="/~demos/*" element={<DemoRenderPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(mocks.useDemo).toHaveBeenCalledTimes(1);
    expect(mocks.useDemo).toHaveBeenNthCalledWith(
      1,
      'components/form/demo',
      undefined,
      undefined,
      'src/components/form/first',
    );
    expect(mocks.useLiveDemo).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Second route ID' }));

    expect(screen.getByText('Demo content')).toBeInTheDocument();
    expect(mocks.useDemo).toHaveBeenCalledTimes(2);
    expect(mocks.useDemo).toHaveBeenNthCalledWith(
      2,
      'components/form/demo',
      undefined,
      undefined,
      'src/components/form/second',
    );
    expect(mocks.useLiveDemo).toHaveBeenCalledTimes(2);
    expect(mocks.useLiveDemo).toHaveBeenLastCalledWith('components/form/demo');
  });

  it('renders Dumi NotFound for an empty ID and keeps hooks stable as route params change', () => {
    render(<DemoRouteHarness />);

    expect(screen.getByTestId('dumi-not-found')).toBeInTheDocument();
    expect(mocks.useDemo).not.toHaveBeenCalled();
    expect(mocks.useLiveDemo).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Raw ID' }));
    expect(screen.getByText('Demo content')).toBeInTheDocument();
    expect(mocks.useLiveDemo).toHaveBeenCalledWith('components/form/demo');

    fireEvent.click(screen.getByRole('button', { name: 'Empty ID' }));
    expect(screen.getByTestId('dumi-not-found')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Encoded ID' }));
    expect(screen.getByText('Demo content')).toBeInTheDocument();
    expect(mocks.useLiveDemo).toHaveBeenCalledWith('components/form/demo');
  });
});
