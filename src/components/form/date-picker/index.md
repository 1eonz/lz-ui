# DatePicker / DateRangePicker

AntD 5 calendar entry using Dayjs values. Single and range controls forward the public AntD props for controlled `value/onChange`, uncontrolled `defaultValue`, locale, disabled dates, status and clear actions. Refs expose focus/blur. Keep timezone and serialization decisions in the application. Pair with `FormItem` for a label; AntD provides arrow-key calendar navigation and Escape dismissal. Empty values and disabled dates use AntD states; async availability/loading/error belong to the caller. Theme tokens set comfortable/compact size and light/dark appearance. Narrow containers should allow the range field to use available width.

```tsx pure
<FormItem label="日期" name="date"><DatePicker /></FormItem>
<DateRangePicker aria-label="日期范围" value={range} onChange={setRange} />
```
