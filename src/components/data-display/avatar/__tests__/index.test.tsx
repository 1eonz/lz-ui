import { createRef } from 'react';
import { renderToString } from 'react-dom/server';
import { fireEvent, render, screen } from '@testing-library/react';
import { Avatar, AvatarGroup } from '..';
import avatarStyles from '../index.module.css';
import { describe, expect, it, vi } from 'vitest';
describe('Avatar', () => {
  it('在图片失败后仍保留根头像的可访问名称并展示 children 回退', () => {
    const { container } = render(
      <Avatar src="/missing.png" alt="客户头像">
        客
      </Avatar>,
    );
    const avatar = screen.getByRole('img', { name: '客户头像' });
    const image = container.querySelector('img');

    expect(avatar.tagName).toBe('SPAN');
    expect(image).not.toBeNull();
    fireEvent.error(image as HTMLImageElement);

    expect(screen.getByRole('img', { name: '客户头像' })).toBe(avatar);
    expect(avatar).toHaveTextContent('客');
  });

  it('透传原生 title，并允许使用 aria-description 避免重复姓名说明', () => {
    render(<Avatar name="周晓轩" title="周晓轩" aria-description="头像内容是成员姓名的缩写。" />);

    const avatar = screen.getByRole('img', { name: '周晓轩' });
    expect(avatar).toHaveAttribute('title', '周晓轩');
    expect(avatar).toHaveAccessibleDescription('头像内容是成员姓名的缩写。');
  });

  it('按 NFC 文本和扩展字素簇生成姓名缩写', () => {
    const decomposedName = 'e\u0301mile';
    const { rerender } = render(<Avatar name={decomposedName} />);

    expect(screen.getByRole('img', { name: decomposedName })).toHaveTextContent('ÉM');

    rerender(<Avatar name="👩🏽‍💻 Alex" />);

    expect(screen.getByRole('img', { name: '👩🏽‍💻 Alex' })).toHaveTextContent('👩🏽‍💻A');

    rerender(<Avatar name="ßmith" />);

    expect(screen.getByRole('img', { name: 'ßmith' })).toHaveTextContent('SS');

    rerender(<Avatar name="ßmith Test" />);

    expect(screen.getByRole('img', { name: 'ßmith Test' })).toHaveTextContent('ST');

    rerender(<Avatar name="ﬃ Brown" />);

    expect(screen.getByRole('img', { name: 'ﬃ Brown' })).toHaveTextContent('FB');
  });

  it('没有原生 Segmenter 时保留组合音节、肤色修饰符与印度语连写，并保持 SSR 文本一致', () => {
    const intlWithoutSegmenter = new Proxy(Intl, {
      get(target, property, receiver) {
        if (property === 'Segmenter') return undefined;
        return Reflect.get(target, property, receiver);
      },
    });
    const englandFlag = '\u{1f3f4}\u{e0067}\u{e0062}\u{e0065}\u{e006e}\u{e0067}\u{e007f}';
    const unitedStatesFlag = '\u{1f1fa}\u{1f1f8}';
    const names = [
      'क्षत्रिय कुमार',
      '👩🏽‍💻 Alex',
      'e\u0301mile',
      `${englandFlag} Example`,
      `${unitedStatesFlag} Example`,
    ];
    const nativeIntl = Intl;
    let fallbackMarkup: string[];
    vi.stubGlobal('Intl', intlWithoutSegmenter);

    try {
      fallbackMarkup = names.map((name) => renderToString(<Avatar name={name} />));
      vi.stubGlobal('Intl', nativeIntl);
      const nativeMarkup = names.map((name) => renderToString(<Avatar name={name} />));

      expect(fallbackMarkup[0]).toContain('क्षकु');
      expect(fallbackMarkup[3]).toContain(`${englandFlag}E`);
      expect(fallbackMarkup[4]).toContain(`${unitedStatesFlag}E`);
      expect(fallbackMarkup).toEqual(nativeMarkup);

      const { rerender } = render(<Avatar name="क्षत्रिय कुमार" />);

      expect(screen.getByRole('img', { name: 'क्षत्रिय कुमार' })).toHaveTextContent('क्षकु');

      rerender(<Avatar name="👩🏽‍💻 Alex" />);

      expect(screen.getByRole('img', { name: '👩🏽‍💻 Alex' })).toHaveTextContent('👩🏽‍💻A');
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('显式传入 null children 时不生成 name 缩写', () => {
    render(<Avatar name="Alex Morgan">{null}</Avatar>);

    const avatar = screen.getByRole('img', { name: 'Alex Morgan' });
    expect(avatar.textContent).toBe('');
  });

  it('使用 aria-labelledby 为根头像提供 accessible name 和 img 语义', () => {
    render(
      <>
        <span id="team-lead-label">团队负责人</span>
        <Avatar name="Default Name" aria-labelledby="team-lead-label" />
      </>,
    );

    const avatar = screen.getByRole('img', { name: '团队负责人' });

    expect(avatar.tagName).toBe('SPAN');
    expect(avatar).toHaveAttribute('aria-labelledby', 'team-lead-label');
    expect(avatar).not.toHaveAttribute('aria-label');
    expect(avatar).toHaveAccessibleName('团队负责人');
  });

  it('按 name 派生姓名缩写和稳定身份色，同时保留显式 role 与标签优先级', () => {
    const avatarRef = createRef<HTMLSpanElement>();
    const repeatedNameRef = createRef<HTMLSpanElement>();
    const differentNameRef = createRef<HTMLSpanElement>();
    const customRoleRef = createRef<HTMLSpanElement>();
    const customBackgroundRef = createRef<HTMLSpanElement>();
    const customBackgroundImageRef = createRef<HTMLSpanElement>();
    render(
      <>
        <Avatar ref={avatarRef} name="周晓轩" />
        <Avatar name="Alex Morgan" />
        <Avatar ref={differentNameRef} name="张莉" />
        <Avatar
          ref={repeatedNameRef}
          name=" 周晓轩 "
          aria-label="重复姓名"
          style={{ marginInlineStart: 4 }}
        />
        <Avatar ref={customRoleRef} name="周晓轩" role="presentation" aria-label="自定义标签" />
        <Avatar
          ref={customBackgroundRef}
          name="周晓轩"
          shape="square"
          style={{ backgroundColor: 'rgb(20, 20, 20)' }}
        />
        <Avatar
          ref={customBackgroundImageRef}
          name="周晓轩"
          style={{ backgroundImage: 'linear-gradient(red, blue)' }}
        />
      </>,
    );

    expect(avatarRef.current).toHaveAccessibleName('周晓轩');
    expect(avatarRef.current).toHaveTextContent('周');
    expect(screen.getByRole('img', { name: 'Alex Morgan' })).toHaveTextContent('AM');
    expect(avatarRef.current?.style.getPropertyValue('--lx-avatar-identity-bg')).toBe(
      repeatedNameRef.current?.style.getPropertyValue('--lx-avatar-identity-bg'),
    );
    expect(avatarRef.current?.style.getPropertyValue('--lx-avatar-identity-bg')).not.toBe(
      differentNameRef.current?.style.getPropertyValue('--lx-avatar-identity-bg'),
    );
    expect(customRoleRef.current).toHaveAttribute('role', 'presentation');
    expect(customRoleRef.current).toHaveAttribute('aria-label', '自定义标签');
    expect(customBackgroundRef.current).toHaveStyle({ backgroundColor: 'rgb(20, 20, 20)' });
    expect(customBackgroundRef.current).toHaveStyle({
      borderRadius: 'var(--lx-avatar-square-radius, 8px)',
    });
    expect(customBackgroundRef.current?.style.getPropertyValue('--lx-avatar-identity-bg')).toBe('');
    expect(customBackgroundImageRef.current).toHaveStyle({
      backgroundImage: 'linear-gradient(red, blue)',
    });
    expect(customBackgroundImageRef.current).not.toHaveClass(avatarStyles.named);
    expect(
      customBackgroundImageRef.current?.style.getPropertyValue('--lx-avatar-identity-bg'),
    ).toBe('');
  });
  it('supports image error fallback and group overflow with stable refs', () => {
    const avatarRef = createRef<HTMLSpanElement>();
    const groupRef = createRef<HTMLDivElement>();
    render(
      <>
        <Avatar ref={avatarRef} aria-label="客户头像" />
        <AvatarGroup ref={groupRef} max={{ count: 2, popover: { trigger: 'hover' } }}>
          <Avatar alt="A">A</Avatar>
          <Avatar alt="B">B</Avatar>
          <Avatar alt="C">C</Avatar>
        </AvatarGroup>
      </>,
    );
    expect(avatarRef.current).toBeTruthy();
    expect(groupRef.current).toBeTruthy();
    expect(groupRef.current).toContainElement(screen.getByText('+1'));
  });
  it('keeps group layout attributes on the same ref root', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <AvatarGroup ref={ref} className="host-group" style={{ order: 2 }}>
        <Avatar>甲</Avatar>
      </AvatarGroup>,
    );
    expect(ref.current).toHaveClass('host-group');
    expect(ref.current).toHaveStyle({ order: 2 });
    expect(ref.current?.querySelector(':scope > .host-group')).not.toBeNull();
  });
});
