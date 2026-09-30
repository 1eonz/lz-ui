# Button

Token-sized action button for forms and toolbars. Uses AntD 5's public `ButtonProps`, including `type`, `danger`, `loading`, `disabled`, `icon`, and `href`. Use a link for navigation when button styling is unnecessary.

```tsx pure
<Button type="primary" onClick={save}>保存</Button>
<Button loading={saving} disabled={!canSave}>提交</Button>

```

`htmlType` defaults to `button` to avoid accidental form submission. Controlled state lives with the caller. Icon-only buttons need `aria-label`. AntD handles Enter/Space, loading, disabled and keyboard focus on the actual button; the lx token layer supplies the theme and reduced-motion values without stacking a second outline. Ref: `ButtonRef` (`HTMLButtonElement | HTMLAnchorElement`). Density, appearance and mode follow the theme provider; long labels may wrap. No options or async data are owned here.
