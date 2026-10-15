---
target_identity: "file:F:\\work\\lz-ui\\docs\\docs-shell.css"
target_fingerprint: "sha256:dd867f630be955e45a8f06f0af3e1b581d01fc37c85e91a670810fff0a736c05"
target_path: "F:\\work\\lz-ui\\docs\\docs-shell.css"
timestamp: 2026-10-14T02-17-24Z
slug: docs-docs-shell-css
closed: true
---
Method: dual-agent (A: /root/tooltip_impeccable_design_review; B: /root/tooltip_detector_browser_evidence)

## Target and mode

Target: `docs/docs-shell.css` and the rendered Tooltip Dumi documentation page at `/components/feedback/tooltip/`. Mode: Read. This review covers the sticky header, common API table, same-page keyboard jump, and narrow-container presentation. Impeccable version: 4.1.3.

## Design review

Design specificity: 3/4. The API content and examples are specific to Tooltip and React administration workflows. The restrained Dumi structure is appropriate for a reference page, though it carries little distinctive visual identity.

Nielsen heuristic scores:

| Heuristic | Score | Evidence |
| --- | ---: | --- |
| Visibility of system status | 3/4 | The focused API region and active TOC item indicate the destination, but the "常用属性" heading is partly or fully behind the sticky header. |
| Match with the real world | 3/4 | Chinese descriptions use familiar React and Ant Design terms with concrete business examples. |
| User control and freedom | 3/4 | The jump preserves a URL hash and browser history; keyboard activation is covered in the independent browser assessment. |
| Consistency and standards | 3/4 | Desktop columns and narrow-screen cards preserve the same API data and native table semantics. |
| Error prevention | 3/4 | The API notes explain controlled state, async content limits, and focusable trigger requirements. |
| Recognition rather than recall | 3/4 | Desktop column headers and mobile field labels repeat the meaning beside each value. |
| Flexibility and efficiency | 3/4 | TOC, global search, and the page-level jump offer faster entry points; the table has no internal property index. |
| Aesthetic and minimalist design | 3/4 | The visual hierarchy is restrained and scannable; the mobile card list requires long vertical scanning. |
| Help users recover from errors | n/a | This reference page has no user-operated error workflow to assess. |
| Help and documentation | 3/4 | Examples, API data, TOC, and global search work together; locating one property within the long list still relies on scanning or browser find. |

Total: 27/36 across nine applicable heuristics (75%, Good). Cognitive load is low to moderate: placement options are grouped into four sets of three, advanced options use disclosure, and the common API list has twelve rows without internal grouping.

Strengths:

- Container-aware cards remove horizontal dragging on narrow screens while preserving the underlying table structure.
- The page-level jump appears before the examples and focuses a named region associated with help text.
- Tooltip examples use concise status guidance and keep interactive content outside the tooltip.

Priority findings:

- [P2] The `常用属性` heading is obscured after the jump. Independent Chromium geometry measured its top at 55.5px against sticky insets of 76px at 768/1280px and 97px at 767px. The table region is visible, but its section context is hidden. Increase the target scroll margin enough to show both the heading and first table row; assert that geometry in the browser test.
- [P2, downgraded to P3 in synthesis] Twelve common API rows require vertical scrolling on phones. The card layout keeps values readable and removes horizontal scrolling; grouping the API contract would require structural markup or another navigation control and is not justified for this bounded layout fix. Keep as a future documentation information-architecture improvement.
- [P3] The browser-default focus outline is offset from the table edge. At 320px, region, wrapper, and table share the same horizontal box, while the focused UA outline has a 2px positive offset and the card rows are inset by table border spacing. Align the focus treatment with the visible table boundary and test the box geometry.

Relevant personas: Sam needs confirmation from a real screen reader because this assessment only verifies markup and browser behavior; Casey benefits from the no-horizontal-scroll card layout but must scan the remaining properties; Alex benefits from the jump but has no section-local property index.

## Detector and browser evidence

CLI command:

```powershell
node "C:\Users\Administrator\.codex\skills\impeccable\scripts\detect.mjs" --json src\components\feedback\tooltip\index.md docs\demos\feedback-tooltip-basic.tsx docs\demos\feedback-tooltip-controlled.tsx docs\demos\feedback-tooltip-accessibility.tsx docs\demos\feedback-tooltip-placements.tsx
```

Raw stdout: `[]`. Exit code: 0. This only means the five scanned markup files had no deterministic rule hits; it does not establish visual, accessibility, or interaction quality.

The live browser detector loaded successfully at 390px, 768px, and 1280px and reported 8, 11, and 24 annotations respectively. Findings included cramped-padding on the off-canvas mobile TOC and theme selector, heading rhythm on Tooltip headings, text-occlusion labels on theme controls at 768px, long-line estimates on 16 documentation paragraphs at 1280px, and Dumi body-level punctuation/transition rules. These are detector annotations, not verified defects; the hidden TOC and repeated theme-control annotations are likely false positives, while the broad prose-width findings are outside this focused anchor/layout change.

Independent Playwright evidence used the isolated export at `http://127.0.0.1:8031/components/feedback/tooltip/`. Four selected Tooltip cases passed across 320, 390, 767, 768, and 1280px. Keyboard Enter reached the named region; API rows did not overlap fixed navigation; the narrow table rendered as cards without document overflow; light/dark headers remained opaque and the mobile menu opened and closed. Local geometry also confirmed the region, direct Dumi wrapper, and table have matching horizontal boxes; the UA focus ring's 2px offset is what creates the visible gap.

## Independent code review

The independent read-only code review found no P0-P2 correctness or routing defect. It identified two P3 regression-test gaps: the end-of-document test only observes the browser's native scroll clamping and does not prove the handler passes `maxScrollY`, and no test drives the container query at exactly 760px. Add direct assertions for both.

## Limits and closeout

Windows Playwright Chromium/WebKit emulation does not establish Safari device behavior, physical touch, real screen-reader announcements, or 200%/400% page zoom. The long mobile API list remains a low-priority content-scan concern, not a blocked interaction. No follow-up design question is needed because this batch is already authorized and the remaining recommendations are documented; Questions skipped: the implementation and test boundaries are explicit.
