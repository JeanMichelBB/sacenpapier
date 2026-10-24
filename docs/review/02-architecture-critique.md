# Phase 2 — Architecture Cross-Critique

Reviewing as code architecture (Next.js 16). Own Phase 1 file: `01-architecture.md` (A1–A8).

## Agree

- **Performance P-1** (Hub.tsx fully client, no server/client split) directly reinforces **A2**: the SPA-vs-routes duplication is exactly why `/` can't be decomposed into server components — splitting Hub by concern is blocked until the routing paradigm is resolved.
- **A11y A8/A9** (HomelabDocsContent untranslated, no lang prop; postmortem template missing header controls) and **Designer D2** (postmortem detail missing toggles) both stem from **A6**'s "large multi-responsibility component with inconsistent chrome" — there's no shared `PageHeader`/layout primitive, so each template reinvents (or forgets) the controls.
- **A11y A1/A6/A7** (lang state resolved post-mount, CookieBanner/PodBadge hardcoded English) are instances of **A3**'s missing `useLang()` hook — a shared hook with SSR-aware initialization (cookie/middleware, per Performance P-8) would fix the FOUC and the untranslated-chrome bugs in one place.
- **Security S2/S3/S4** (unfiltered proxy passthrough, no fetch timeouts, no rate limiting across 4 route handlers) is a shared-primitives gap, same category as A4/A5: a `src/lib/fetchWithTimeout.ts` + a single allow-listed response mapper used by all `/api/infra/*` routes would fix all three findings at once instead of patching each route file separately.
- **Hiring-manager F10 / Performance P-12** (Turbopack tracing warning on `posts.ts`) reinforces A6's complexity flag on the lib layer, not just components.

## Disagree

- **Content-editor C1** proposes either translating body content or relabeling/hiding the toggle — both are content-layer patches. The real fix is schema-level: `Post`/`HomelabItem` need a `body: {en, fr}` (or locale-keyed) shape from the start, enforced by the type, not left to per-page discretion about whether to show a toggle. Patching the UI around a missing data model just defers the same gap to the next content type.
- **A11y A1** suggests "serve real FR routes... instead of post-hydration DOM mutation" as if it's purely an SEO/crawl fix; architecturally this also requires resolving A2 first — you can't cleanly add `/fr` segments or middleware-based locale negotiation while `/` is a client-state SPA duplicating what the real routes do. Sequencing matters: A2 before A1.
- **Performance P-7/P-8** frame the FOUC fix as "a blocking inline script" or "middleware setting a cookie" as alternatives; given A3, the correct fix is one shared mechanism (middleware/cookie feeding both `lang` and `dark` class pre-render), not two separate scripts solving parallel instances of the same duplicated-state problem.

## Missed

- No shared data-fetch/error-boundary layer for the four `/api/*` proxy routes — each hand-rolls its own `fetch`/`try-catch` (Security S2/S3, Performance). This is an architectural gap (no `lib/httpClient.ts`), not four independent bugs.
- `src/proxy.ts`, `middleware`-equivalent redirect logic, and the lang/theme concerns all want the same place to live (edge middleware) but none exists — a missed opportunity to consolidate locale detection (A1), security headers (S1), and subdomain routing (S10) into one middleware file instead of three separate mechanisms.
