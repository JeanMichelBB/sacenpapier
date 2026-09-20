# Plan — Sept 20

Site critique findings, from a live scan of sacenpapier.org (desktop + mobile). Work top to bottom,
one item at a time — check off as shipped.

- [x] Clarify the featured/highlighted project card mechanic — added a hint line above the grid
  ("Click a project to preview it live below." / FR equivalent) via `t.projectPreviewHint` in
  `src/lib/strings.ts`, rendered in `src/components/Hub.tsx`. Verified in browser (en/fr), no
  console errors.
- [x] Strengthen homepage copy — replaced the generic tagline with the About page's voice:
  "Four live products, a homelab I run and occasionally break, and a public log of what went
  wrong and why." (+ FR equivalent), both updated in `src/lib/strings.ts`. Verified in browser,
  both languages, no console errors.
- [x] Reconsider placement/prominence of "Not actively job hunting — open to interesting
  conversations." Removed from the homepage header (was the first line under the title, ahead of
  any project); kept as the opening line of the About page, where it already lived. Verified in
  browser (header clean, About page still shows it), no console errors.
- [x] Differentiate tag chips by layer (frontend/backend/infra) — added a small color dot to each
  chip (sky = frontend, violet = backend, amber = infra) via `src/lib/tagLayer.ts`, wired into
  `ProjectCard.tsx` and `ProjectPreview.tsx`. Verified in browser, dots distinguishable, no console
  errors.
- [x] Check the "x" project card appearing twice — confirmed not a bug: the layout renders every
  project once as a compact grid card, plus the currently-selected project a second time, expanded,
  in `ProjectPreview` below (with the live iframe). "x" is selected by default on load, so it shows
  twice by design. No change needed.
- [x] Add a one-line caption to the Infrastructure page's live stats — added a pulsing-dot caption
  "Live telemetry, pulled from the cluster — refreshes every 30s." (+ FR) right under the stat
  strip via `t.infraLiveCaption` in `src/lib/strings.ts` / `InfrastructureContent.tsx`. Verified in
  browser, no console errors.
- [x] Minor: confirm favicon/tab branding is set — confirmed `src/app/favicon.ico` (25KB, 256×256)
  exists and is served correctly via Next.js App Router convention (`GET /favicon.ico` returns the
  real image). Original observation was a browser-pane rendering quirk, not a real gap. No change
  needed.

## Notes
- Source: live browser scan of sacenpapier.org, 2026-09-20 (desktop 1024px + mobile 375px,
  light/dark toggle, FR toggle, filter tabs all spot-checked).
- Full write-up given in chat same day, this file is the actionable trim of it.
