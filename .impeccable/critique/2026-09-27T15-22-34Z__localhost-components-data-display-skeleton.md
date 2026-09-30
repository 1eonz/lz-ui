---
target: Radio / Upload / Empty / Skeleton docs and primitives
total_score: 28
max_score: 40
na_heuristics:
p0_count: 0
p1_count: 0
target_identity: 'url:http://localhost:8001/components/data-display/skeleton'
timestamp: 2026-09-27T15-22-34Z
slug: localhost-components-data-display-skeleton
---

# Radio / Upload / Empty / Skeleton 批次评审

## Design Health

| #   | Heuristic                       | Score | Key issue                                                                                                       |
| --- | ------------------------------- | ----: | --------------------------------------------------------------------------------------------------------------- |
| 1   | Visibility of system status     |     3 | Skeleton and Upload demos expose loading/local selection status; Upload transport lifecycle remains host-owned. |
| 2   | Match system / real world       |     3 | CRM labels and file-selection language are concrete; upload transport boundary needs documentation.             |
| 3   | User control and freedom        |     3 | Radio and skeleton controls are reversible; upload cancel/remove remains AntD/host behavior.                    |
| 4   | Consistency and standards       |     3 | Wrappers preserve AntD public contracts and lx token scope.                                                     |
| 5   | Error prevention                |     3 | Local-only Upload default prevents accidental requests; explicit beforeUpload can override it.                  |
| 6   | Recognition rather than recall  |     2 | Live demos now show key states, but the richer upload lifecycle is still prose.                                 |
| 7   | Flexibility and efficiency      |     2 | Public pass-through APIs are flexible; no full drag/drop or progress recipe yet.                                |
| 8   | Aesthetic and minimalist design |     3 | Quiet tokenized wrappers fit the docs and business context; primitives do not yet express every Stitch detail.  |
| 9   | Error recovery                  |     3 | Skeleton demo has retry through Empty; Upload request recovery belongs to host.                                 |
| 10  | Help and documentation          |     3 | Each new component has a runnable demo and boundary docs; narrow viewport evidence is incomplete.               |

Total: 28/40. The result is acceptable for a primitive adapter batch, with remaining work concentrated in responsive evidence and the intentionally deferred Upload composition.

## Specificity and evidence

The implementation is authored for lx-ui's AntD 5 adapter architecture through explicit exports, lx tokens, CRM copy, and host-owned transport boundaries. `detect.mjs` returned `[]`; this is only deterministic evidence. In the in-app browser, Radio ArrowRight selected the next option, Upload exposed a local file input with the declared accept list, Empty/Skeleton rendered loading/ready/error/retry states, and DynamicForm switched dark/glass/compact tokens without page overflow. The browser API did not expose viewport override or system reduced-motion controls, so new 930/390/320 screenshots and system-level reduced-motion screenshots remain unverified.

## Priority issues

- **P2 Upload composition scope**: Stitch shows drag/drop, progress, success and failure cards while this batch intentionally ships a thin primitive. Keep the boundary explicit and schedule a reviewed UploadField composition before claiming the full design.
- **P2 Responsive evidence**: The current browser surface cannot set 930/390/320 viewports. Re-run those dimensions in a viewport-capable browser before release.
- **P2 Theme matrix evidence**: The demos use an isolated light provider inside the Dumi shell. Verify representative dark/glass/compact combinations for each primitive in a viewport-capable browser.

## Personas and observations

- A first-time developer can copy a working demo and see the primary state, but still needs the Upload docs to understand `action`, `customRequest`, and `beforeUpload` precedence.
- A keyboard and screen-reader user gets a labelled Radio fieldset and a busy Skeleton region; the Upload file lifecycle and host error announcement need a host recipe.
- A narrow-screen operator has no new screenshot evidence in this environment, although desktop pages reported no horizontal overflow.

## Questions

The next design decision is whether the rich Stitch Upload section becomes a separate `UploadField` composition or remains host-owned application UI around this primitive.
