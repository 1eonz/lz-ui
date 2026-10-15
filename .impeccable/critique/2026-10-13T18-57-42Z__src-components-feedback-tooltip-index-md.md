---
target: Tooltip documentation page
total_score: 33
max_score: 40
na_heuristics:
p0_count: 0
p1_count: 0
target_identity: "file:F:\\work\\lz-ui\\src\\components\\feedback\\tooltip\\index.md"
target_fingerprint: "sha256:a0fc6cb71d9dd8b57929c63ae9f19d08126cd298bb24523cd700d9f6785fddba"
target_path: "F:\\work\\lz-ui\\src\\components\\feedback\\tooltip\\index.md"
timestamp: 2026-10-13T18-57-42Z
slug: src-components-feedback-tooltip-index-md
closed: true
---
Method: dual-agent (A: /root/tooltip_impeccable_design · B: /root/tooltip_browser_evidence_final)

## Design Health Score

| # | Nielsen heuristic | Score | Key issue |
|---|---|---:|---|
| 1 | Visibility of system status | 3/4 | Hover, focus, touch, and description merging are explained; the mobile API comparison still takes an extra gesture. |
| 2 | Match with the real world | 4/4 | Customer synchronization, next-sync timing, and disabled-action reasons use familiar business language. |
| 3 | User control and freedom | 3/4 | Examples use focusable controls and normal dismissal; mobile API browsing requires a deliberate horizontal gesture. |
| 4 | Consistency and standards | 4/4 | Public Ant Design 5 placement names and Tooltip properties are used consistently. |
| 5 | Error prevention | 3/4 | Disabled-action guidance and accessible description behavior are shown; the API table can be overlooked on narrow screens. |
| 6 | Recognition rather than recall | 4/4 | Defaults, common properties, and all 12 placements are visible in the reference. |
| 7 | Flexibility and efficiency | 3/4 | A short usage path, focused demos, and advanced API details support different reading speeds. |
| 8 | Aesthetic and minimalist design | 3/4 | The restrained documentation hierarchy is clear; the API table is dense at phone width. |
| 9 | Error recognition and recovery | 2/4 | Troubleshooting and recovery guidance specific to Tooltip remains limited. |
| 10 | Help and documentation | 4/4 | The page pairs usage, realistic demos, accessibility notes, and a property reference. |
| **Total** | | **33/40 (Good)** | All ten heuristics apply to this Read-mode documentation surface. |

## Design Specificity Verdict

**LLM assessment:** Specificity is moderate. The examples are grounded in lx-ui business workflows, especially customer synchronization and disabled order submission, and document Ant Design 5-compatible properties. The surrounding Dumi documentation composition is conventional and could belong to another component library unchanged.

**Deterministic scan:** `detect.mjs --json` ran against the Tooltip component, index page, and three demo files; exit code was 0 and stdout was `[]`, meaning no deterministic rules matched. Browser injection succeeded. The detector visualization marked 41 nodes, mostly repeated `line-length` and `cramped-padding` findings in the Dumi shell and long Chinese text, plus shell-level gradient and transition observations. These are not 41 independent Tooltip defects. Browser health reported no page errors.

**Visual evidence:** Chromium screenshots were captured at desktop and mobile widths. The browser-side detector overlay was captured under `.codex/test-results/tooltip-assessment-20261014`; this report does not claim that the overlay remains visible in the user's browser tab.

## Overall Impression

The page gets developers from a copyable example to realistic interaction demos and then to the full API. The examples feel credible for an ERP/CRM library, while the narrow-screen property comparison and the complexity of the basic demo are the clearest opportunities to reduce effort.

## What's Working

- The short usage example precedes more involved demonstrations, so first-time readers can start without studying every option.
- The accessibility demo shows how Tooltip content merges with an existing host description and explains a focusable help action beside a disabled button.
- Placement choices are grouped spatially, and the mobile hint names both touch scrolling and keyboard navigation.

## Priority Issues

- **[P2] The API table requires horizontal scrolling at 320px.** This interrupts property comparison on a phone. Keep the property name and type visible together at narrow widths, or present a compact responsive property layout while preserving defaults and descriptions.
- **[P3] The basic demo contains a `MutationObserver` to display `aria-describedby`.** It demonstrates a useful accessibility detail, but the short introductory example becomes harder to understand and reuse. Keep the basic example minimal and place the attribute-observation detail in a focused accessibility demo.

## Persona Red Flags

- **Alex, power user:** The 12 placement controls still occupy one decision point even though visual grouping helps. The API table's horizontal movement also slows rapid comparison.
- **Jordan, first-time user:** The copyable example and concrete Chinese labels clarify the first action. Advanced type names still require reading the API section, but no ambiguous action was observed.
- **Casey, mobile user:** At 320px, later API columns require horizontal scrolling. The added hint explains the gesture; the 18 example triggers were measured at 44px minimum under coarse-pointer simulation.

## Cognitive Load

One of eight checklist items is unmet: the 12 placement values remain more than four visible options at a single decision point. The values are grouped into four directions with three controls per group, which improves scanning but does not reduce the total choice count. The other seven checklist items were supported by the inspected hierarchy, grouping, progressive disclosure, and single primary reading path.

## Minor Observations

- On a 320px screenshot, the API table remains a horizontal scrolling region; the hint improves discoverability but does not remove the comparison cost.
- The deterministic overlay's line-length findings count Chinese characters using an English-oriented heuristic and also highlight Dumi shell elements. Treat those annotations as prompts for manual inspection, not automatic component defects.

## Questions to Consider

- Could mobile readers compare a property's type, default, and description without leaving the row horizontally?
- Should the 12 placements remain visible together, or should the demo reveal one directional group at a time?
- Can the introductory example remain copyable without observing a DOM attribute at runtime?
