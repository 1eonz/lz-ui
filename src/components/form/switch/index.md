# Switch

Immediate on/off control backed by AntD 5. Use `checked/onChange` for controlled state or `defaultChecked` for uncontrolled state. Pair it with a visible external label; `FormItem` supplies the label and should use `valuePropName="checked"`. Use a checkbox for a choice that takes effect only after form submission.

<code src="../../../../docs/demos/switch.tsx"></code>

```tsx pure
<label htmlFor="enabled">启用</label>
<Switch id="enabled" checked={enabled} onChange={setEnabled} />
<label htmlFor="preview">显示预览</label>
<Switch id="preview" defaultChecked />
<FormItem name="enabled" label="启用" valuePropName="checked">
  <Switch />
</FormItem>
```

`SwitchProps` passes through AntD's `disabled`, `loading`, `size="small"`, and other public options. `onChange` fires for user activation with the next checked boolean and its event; a programmatic prop change does not fire it. `SwitchRef` is the focusable button while mounted. AntD owns Space and Enter activation and disables interaction during loading. AntD draws the keyboard focus indicator on the switch itself using the provider's theme tokens; lx-ui does not add a second outline. The transition uses lx-ui tokens across light/dark themes, and reduced motion removes the wrapper transition. The provider maps density to AntD's control height, while the explicit `small` size is for compact contexts. The host owns request failure and rollback, while empty states belong to the containing form. Avoid rendering hundreds of switches without list virtualization.
