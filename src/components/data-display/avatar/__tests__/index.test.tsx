import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Avatar, AvatarGroup } from '..';
import { describe, expect, it } from 'vitest';
describe('Avatar', () => {
  it('exposes alt text', () => {
    render(<Avatar src="/missing.png" alt="客户头像" />);
    expect(screen.getByRole('img', { name: '客户头像' })).toBeInTheDocument();
  });
  it('supports image error fallback and group overflow with stable refs', () => {
    const avatarRef = createRef<HTMLSpanElement>();
    const groupRef = createRef<HTMLDivElement>();
    render(
      <>
        <Avatar ref={avatarRef} src="/missing.png" alt="客户头像" onError={() => true} />
        <AvatarGroup ref={groupRef} maxCount={2}>
          <Avatar alt="A">A</Avatar>
          <Avatar alt="B">B</Avatar>
          <Avatar alt="C">C</Avatar>
        </AvatarGroup>
      </>,
    );
    expect(avatarRef.current).toBeTruthy();
    expect(groupRef.current).toBeTruthy();
    expect(document.querySelector('.ant-avatar-group')).toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();
  });
  it('preserves the small size contract without a forced minimum dimension', () => {
    const { container } = render(<Avatar size="small" alt="小头像" />);
    const avatar = container.querySelector('.ant-avatar');
    expect(avatar).toHaveClass('ant-avatar-sm');
    expect(avatar).not.toHaveStyle({ minWidth: '2rem', minHeight: '2rem' });
  });
});
