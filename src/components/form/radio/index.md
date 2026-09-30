# Radio

<code src="../../../../docs/demos/radio.tsx"></code>

Radio exposes Ant Design's public radio semantics with a typed `Radio.Group`. Use `options`, `value/onChange`, or `defaultValue`; arrow keys move within the group and Space selects the focused option. Pair it with `FormItem` for a visible label. Large option sets should use a searchable Select.

```tsx
<Radio.Group
  options={[
    { label: '标准', value: 'standard' },
    { label: '高级', value: 'advanced' },
  ]}
  value={mode}
  onChange={(event) => setMode(event.target.value)}
/>
```

`disabled`, `buttonStyle`, `optionType`, and other AntD public props pass through. The ref for `Radio` focuses one option; `RadioGroup` exposes the group element. Loading and remote option errors belong to the host form.
