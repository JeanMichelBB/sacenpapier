# Phase 2 — Cross-Critique (Accessibility + i18n)

## Agree
- **C1** (content-editor): post/doc bodies never translated — same root cause as my **A8**; these are describing one gap, not two.
- **F6** (hiring-manager) and **D10** (designer) both cite `/documentation`'s `link-in-text-block` failure — corroborates **A3**; **C4** (content-editor) correctly traces it to `linkify()` density, reinforcing the fix.
- **D2** (designer) confirms **A9**: postmortem detail template ships no header controls at all, not just no language toggle — same missing-shared-header root cause.
- **R6** (recruiter) independently reproduces **A6** (hardcoded-English `CookieBanner`) via screenshot evidence.
- **P-8** (performance) and **A1** (mine) are the same defect from two angles: post-hydration `lang` switching causes both an English flash (P-8) and a non-crawlable locale (A1).
- **D5** (designer): `text-xs` overuse correlates with my **A2** contrast failures — same small/light-gray text pattern.

## Disagree
- **C1**'s proposed fix includes "hide the toggle on post/doc pages" as an acceptable alternative to translating. This trades a disclosed gap for removing FR access outright — worse for i18n than scoping the claim. Prefer labeling content as EN-only over disabling the toggle.
- **D5**'s fix (bump `text-xs` → `text-sm`) treats size as the cause; the actual A2 failure is color (zinc-500/600 on zinc-950/white), not size — upsizing alone won't clear 4.5:1.

## Missed
- Header icon-only links (`GithubLink`/`LinkedinLink`/`EmailLink`, flagged by **R3** as a UX/CTA problem) were never checked for accessible names — if they rely on `title` alone rather than `aria-label`, screen readers may announce them poorly or not at all.
- `CookieBanner` mounts without `role="status"`/`aria-live`, so screen-reader users get no announcement when it appears, compounding **A6**/**D1**.
