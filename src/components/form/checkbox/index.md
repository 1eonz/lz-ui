# Checkbox

Boolean choice backed by AntD 5. Use `checked/onChange` for controlled state or `defaultChecked` for uncontrolled state. `indeterminate` shows a partial selection; it does not change the submitted boolean value. Use `FormItem` with `valuePropName="checked"` when collecting it in a form. Provide a visible label through `children` or `FormItem`; an icon alone is not an accessible name.

<code src="../../../../docs/demos/checkbox.tsx"></code>

```tsx pure
<Checkbox checked={subscribed} onChange={(event) => setSubscribed(event.target.checked)}>
  接收通知
</Checkbox>
<Checkbox defaultChecked>接收通知</Checkbox>
<FormItem name="subscribed" label="接收通知" valuePropName="checked">
  <Checkbox />
</FormItem>
```

`CheckboxProps` passes through AntD's `disabled`, `indeterminate`, and other public options. `onChange` fires for user changes with an event whose `target.checked` is the new state; changing a prop programmatically does not fire it. `CheckboxRef` is AntD's public focus handle while mounted. AntD owns the Space key behavior and the native disabled state. AntD draws the keyboard focus indicator on the checkbox itself using the provider's theme tokens; lx-ui does not add a second outline to its label wrapper. Control height follows density tokens in light and dark modes; reduced motion removes the wrapper transition. Loading, empty, and asynchronous failure states belong to the surrounding form or data request. For a list of choices, use AntD's `Checkbox.Group` until a public lx-ui group is reviewed; keep large choice sets searchable rather than rendering an unbounded list.
