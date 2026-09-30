# Input

Single-line text entry backed by AntD 5. Use `InputProps` for controlled `value/onChange` or uncontrolled `defaultValue`; `InputRef` exposes AntD's focus handle. Supply an associated label, preferably through `FormItem`. `status="error"`, `disabled`, `readOnly`, `allowClear`, prefix and suffix are passed through. The theme supplies height for comfortable/compact density and colors for light/dark modes. Keyboard editing and focus use the native input. This component owns no loading or empty data state; use a field-level status or placeholder where appropriate.

`TextArea` is the multiline companion and uses the same token and form control contract. Bound `autoSize` on long notes to prevent a growing field from moving later actions off screen.

```tsx pure
<FormItem label="姓名" name="name"><Input autoComplete="name" /></FormItem>
<Input aria-label="搜索" value={query} onChange={event => setQuery(event.target.value)} />
```
