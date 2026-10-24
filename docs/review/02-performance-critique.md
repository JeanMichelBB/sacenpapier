# Phase 2 — Performance Cross-Critique

Reviewer: frontend performance engineer (Phase 1: `01-performance.md`). Cross-reading all eight Phase 1 reports.

## Agree

- **A6** (architecture, `Hub.tsx` 634 lines mixing view-state/data-fetch/markup) and **A2** (routing duplication) reinforce **P-1**: splitting Hub into server chrome + client leaves fixes both the architecture smell and the perf cost in one move.
- **D6** (designer: iframe cache-busts every mount, no loading skeleton) independently confirms **P-4**'s root cause for the 6.7s mobile LCP — strong signal this is the top fix.
- **F3**/**F10** (hiring manager) restate **P-11** (`next start`/`standalone` mismatch) and **P-12** (Turbopack tracing warning in `posts.ts`) verbatim — same evidence, same fix.
- **S3** (security: no fetch timeouts/AbortController on API routes) is the same defect as **P-5**'s polling cost, just framed as a DoS risk instead of a main-thread/network cost — one fix serves both.
- **A3** (architecture's proposed `useLang()` hook) would also fix part of **P-8**'s root cause by centralizing the lang-read timing, though it doesn't by itself move the read before first paint.

## Disagree

- **C1** and **A8** want the ~20k words of post/doc content translated into French and shipped for both locales. Implementing that *before* fixing **P-2** (full `sections` bodies already round-tripped unused on the homepage) doubles the unused payload instead of fixing it. Sequence matters: strip/trim body payload first (P-2), then any FR content addition should be fetched per-locale/per-detail-page, not bundled into the same oversized client props.
- **D1**'s "reserve layout space site-wide" for the cookie banner is fine, but if implemented as a padding-based reservation computed via JS/layout effect rather than CSS, it risks adding another layout-thrash/FOUC source on top of P-7/P-8. Prefer a pure-CSS reserved slot.

## Missed

- `HomelabDocsContent.tsx` is `"use client"` and imports `src/data/homelab.ts` (~29KB) directly, plus `Hub.tsx`'s `activeView` branches ship every view's code in one client bundle regardless of which tab is active. No `dynamic()`/code-splitting per view. This compounds A2's architecture duplication into an actual bundle-size/TTI cost nobody flagged from the loading-cost angle — server-render `homelab.ts` data and lazy-load non-default `activeView` branches.
