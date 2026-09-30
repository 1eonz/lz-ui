# InputNumber

Numeric entry backed by AntD 5. Supports `value/onChange`, `defaultValue`, `min`, `max`, `step`, `precision`, `formatter` and `stringMode`. Use `stringMode` for high precision financial values. The caller validates domain rules and supplies a label through `FormItem` or `aria-label`. `status="error"`, `disabled`, and keyboard stepping pass through. Ref: `InputNumberRef`. Theme controls height, density and light/dark colors. This control has no async loading or options state.

```tsx pure
<FormItem label="数量" name="quantity"><InputNumber min={0} /></FormItem>
<InputNumber aria-label="数量" value={quantity} onChange={setQuantity} />
```
