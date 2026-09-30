# Select

Choice control backed by AntD 5. Keep `virtual` enabled for large option lists. Use `SelectProps` for controlled `value/onChange` or uncontrolled `defaultValue`; `SelectRef` supports focus/blur. The caller owns remote search, loading, error recovery and cancellation. `options=[]` gives AntD's empty state; `notFoundContent` can supply a recovery message. `status="error"` and `disabled` pass through. Pair with `FormItem` for an accessible label. Arrow keys, typeahead and Escape follow AntD behavior. Theme tokens size the root for comfortable/compact density and light/dark modes.

```tsx pure
<FormItem label="城市" name="city"><Select options={cities} showSearch /></FormItem>
<Select aria-label="城市" value={city} onChange={setCity} options={cities} loading={loading} />
```
