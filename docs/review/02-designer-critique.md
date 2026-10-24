# UX/Visual Designer — Cross-Critique (Phase 2)

## Agree
- **A2/A3/A4/A9** (contrast, link-in-text-block, no `<main>`, no focus ring) — directly support D5/D10; fix together, same root causes.
- **A6/A7/C1** (cookie banner + PodBadge + body content not localized) — matches my D1/D2 pattern of inconsistent chrome across templates; strengthens the case for a shared header/i18n component.
- **R1–R4, R7** (no name/role/CTA above fold, jargon, no visual hierarchy in nav) — real UX gaps I under-scoped in Phase 1; support these as higher priority than my own D3/D4 nav-label issues.
- **A5** (focus-visible missing) — agree, should ride with D5's type-scale pass.

## Disagree
- **Performance P-3/P-4 (remove/lazy-load iframe, drop cache-bust):** I agree cache-busting and no skeleton are bugs (D6), but the iframe itself should stay as the visual centerpiece — it's the single most credible "I actually run this" signal (also praised in hiring-manager's top-5). Fix: `loading="lazy"` + skeleton + conditional cache-bust (user-triggered refresh) solves the 6.7s LCP without sacrificing the preview. Full removal/click-to-load trades the strongest visual differentiator for a metric; a lazy-loaded below-fold iframe with a placeholder gets both.
- **A2's contrast fix vs. my D5:** no real conflict — bumping zinc-500→400 and enlarging `text-xs`→`text-sm` are complementary, not competing; do them in one pass as A2 proposes.

## Missed
- No one flagged that the site has **no distinct hover/active state system** for cards vs. nav pills vs. pagination — interactive affordance relies entirely on cursor change, no visual feedback (opacity/scale/border), making the dense tag/pill UI (C5, C7) feel static and unclickable at a glance.
