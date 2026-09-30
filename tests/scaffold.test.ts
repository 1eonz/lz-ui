import { LX_UI_VERSION } from '../src/index';

describe('lx-ui foundation scaffold', () => {
  it('exposes a foundation version before UI components are added', () => {
    expect(LX_UI_VERSION).toBe('0.0.0-alpha.0');
  });
});
