---
target: Table documentation and shared Dumi shell
total_score: 33
max_score: 40
na_heuristics: ""
p0_count: 0
p1_count: 0
target_identity: "file:F:\\work\\lz-ui\\docs\\docs-shell.css"
target_fingerprint: "sha256:b8a3e2f0b7b356bbd62102420bc0bd736e74ae8eb93529ac913b18bfb31ba732"
target_path: "F:\\work\\lz-ui\\docs\\docs-shell.css"
timestamp: 2026-10-05T17-23-09Z
slug: docs-docs-shell-css
closed: true
---
Method: dual-agent (A: /root/table_docs_ux_assessment · B: /root/table_impeccable_assessment_b)

Target: Table component documentation and demo, plus the shared Dumi documentation shell. Surface mode: Read; demo interactions are evaluated as Operate.

## Design Health Score

| # | Heuristic | Score | Key issue |
| -: | --- | ---: | --- |
| 1 | Visibility of System Status | 3/4 | Selection, loading, error, and empty states are clear; mobile search is unavailable. |
| 2 | Match System / Real World | 4/4 | Procurement, suppliers, fulfillment, approval, and amounts form a specific ERP scenario. |
| 3 | User Control and Freedom | 3/4 | Filtering, paging, detail, and focus recovery work; mobile search is limited. |
| 4 | Consistency and Standards | 4/4 | Theme tokens, row heights, density, and narrow table scrolling have clear contracts. |
| 5 | Error Prevention | 3/4 | Selection and row actions are named; screen-reader behavior was not tested. |
| 6 | Recognition Rather Than Recall | 3/4 | Status and selection count remain visible; mobile has no search entry point. |
| 7 | Flexibility and Efficiency | 3/4 | Keyboard sorting, selection, filtering, and horizontal scrolling are supported; mobile retrieval is slower. |
| 8 | Aesthetic and Minimalist Design | 3/4 | Table hierarchy is clear; the documentation shell has weak product identity. |
| 9 | Error Recovery | 4/4 | Empty, error, loading, and detail-close states have recovery paths. |
| 10 | Help and Documentation | 3/4 | API and examples are complete; terminology density slows scanning. |
| **Total** | | **33/40 (Good)** | Scoped to this batch, not a whole-site or library release certification. |

## Design Specificity Verdict

The procurement example is product-specific: purchase orders, suppliers, approvals, and fulfillment establish an ERP task context. Narrow layouts keep horizontal movement inside a named table region rather than widening the document. The shared Dumi shell remains close to its default visual style, so the lx-ui identity is carried mostly by the logo and text.

The deterministic detector command `node "C:\Users\Administrator\.codex\skills\impeccable\scripts\detect.mjs" --json docs/demos/table.tsx src/components/data-display/table/index.md` returned `[]` with exit code 0. This means no deterministic rule matched; it does not establish visual quality. Assessment B used a fresh Chrome profile but did not inject a visible detector overlay, so no overlay is claimed.

Assessment A initially reported a 48px narrow Table header and low footer contrast. The current 16-case viewport/theme/density matrix records the interactive Table header at 36px and rows at 48px/36px; the basic example header is only visually estimated from screenshots. Edge computed-color checks report AA-or-better contrast for the observed documentation search hint, footer helper text, and page links. Neither initial P1 was reproduced and neither is counted as an open issue.

## Overall Impression

The Table page connects API explanation to a realistic procurement workflow. Selection, filtering, details, paging, and recovery states are understandable and backed by browser or test evidence. The highest-impact gap is the absence of a usable search entry point on mobile documentation pages.

## What's Working

- Procurement language makes the demo more useful than a generic sample table.
- A named, focusable inner region owns narrow-screen horizontal scrolling; the document itself stays within the viewport.
- Shared theme tokens and tests keep comfortable/compact row sizes aligned across the provider and components.

## Priority Issues

### [P2] Mobile documentation search is unreachable

At widths below 768px, Dumi hides the entire SearchBar. At 390px there is no visible search button, and Ctrl+K cannot focus the hidden input. Readers must scan a long component navigation list instead of searching.

Fix: add a visible, keyboard-focusable mobile search entry point in the project-owned docs shell and reuse Dumi search state/results. Verify touch, keyboard, light/dark, and 320/390px result layout. Suggested command: `/impeccable adapt`.

### [P3] Documentation shell identity is weak

The navigation remains close to the Dumi default style, making the docs site visually interchangeable with other Dumi sites.

Fix: compare the shell with the committed product design before selectively strengthening navigation, spacing, or brand-color details. Suggested command: `/impeccable bolder`.

## Persona Red Flags

- Alex (power user): desktop Ctrl+K and table keyboard operations are available; mobile search cannot be used.
- Jordan (first timer): the procurement context is legible, but `dataIndex`, `render`, and `rowKey` appear in dense API explanations and require cross-reference.
- Sam (keyboard or low-vision user): Table scrolling and focus restoration have evidence; screen-reader output, high zoom, and mobile search keyboard behavior remain unverified.

## Minor Observations

- Theme controls expose more than four brand/eastern palette choices when expanded. They are secondary developer documentation controls, but visual swatches or grouping could improve scanning.
- Assessment B saw a mobile title close to the sticky navigation after programmatic scrolling. It was not reproduced using a TOC link or keyboard navigation and is not treated as a defect.
- Assessment B's demo-state selector was inconclusive; that interaction path is not claimed as browser-verified.

Questions skipped: there are only 2 Priority Issues, below the skill's threshold of 3 for required follow-up questions; the user has asked for continued implementation.
