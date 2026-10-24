# Phase 0 — Baseline Measurements

Raw, as-measured data for the review project. No recommendations here — just numbers and what command produced them. Generated 2026-10-23 against commit `87c1eea` (branch `main`).

Environment note: `AGENTS.md` at the repo root warns this Next.js install may differ from training-data assumptions. Confirmed one real difference below: `next build` (Turbopack, Next 16.3.8) no longer prints a "First Load JS" column in its route table — see §1.

---

## 1. Build: `npm ci && npm run lint && npm run build`

- `npm ci`: exit 0. 361 packages added, 7s. `npm audit`: 1 critical severity vulnerability flagged (not investigated further here — out of scope for a read-only baseline).
- `npm run lint` (`eslint`): **exit 1** — 17 errors, 4 warnings across 13 files.
  - Top rules: `react-hooks/set-state-in-effect` (17×), `@typescript-eslint/no-unused-expressions` (2×), `react-hooks/exhaustive-deps` (1×).
  - Top offending files: `src/components/HomelabDocsContent.tsx` / `HomelabDocsContent 2.tsx` (4 issues each — note the untracked `" 2.tsx"` duplicate files visible in `git status` are also linted and carry the same issues), `src/components/Hub.tsx` (3), plus one issue each in `opengraph-image.tsx`, `AboutPageClient.tsx`, `CookieBanner.tsx`, `DocumentationPageClient.tsx` / `DocumentationPageClient 2.tsx`, `InfrastructurePageClient.tsx`, `PodBadge.tsx`.
- `npm run build` (`next build`, Turbopack): **exit 0**, compiled in 1131ms, TypeScript check in 1265ms, 83 static pages generated in 1054ms.
  - 3 build warnings, all "Dynamic filesystem access causes tracing of the whole project" in `src/lib/posts.ts` (used by `src/lib/updates.ts` → `/updates` page and `/updates/rss.xml` route) — `fs.readdirSync`/`path.join` on a non-statically-scoped path, flagged by Turbopack's tracer as a potential full-project bundling/deploy-size risk.

### Route table (as printed by `next build`)

Next.js 16.3.8 + Turbopack no longer emits per-route "First Load JS" sizes in this build output — the table below is exactly what the build printed, with no size column available from this command. (If per-route JS size is wanted for the review, it would need to come from a separate bundle-analyzer step, not `next build` itself — flagging this as an environment-capability gap rather than fabricating numbers.)

| Route | Type |
|---|---|
| `/` | ○ Static |
| `/_not-found` | ○ Static |
| `/about` | ○ Static |
| `/api/backend-latency` | ƒ Dynamic |
| `/api/infra/k3s` | ƒ Dynamic |
| `/api/infra/nodes` | ƒ Dynamic |
| `/api/pod` | ƒ Dynamic |
| `/documentation` | ○ Static |
| `/infrastructure` | ○ Static |
| `/opengraph-image` | ○ Static |
| `/postmortems` | ƒ Dynamic |
| `/postmortems/[slug]` | ● SSG (17 paths — 3 shown + "14 more" in build output) |
| `/robots.txt` | ○ Static |
| `/sitemap.xml` | ○ Static |
| `/updates` | ƒ Dynamic |
| `/updates/[slug]` | ● SSG (49 paths — 3 shown + "46 more" in build output) |
| `/updates/rss.xml` | ƒ Dynamic |

Legend: ○ prerendered static · ● SSG via `generateStaticParams` · ƒ server-rendered on demand. Full raw log saved at `/tmp/baseline_build.log` (not copied into the repo — regenerate with `npm run build` if needed).

---

## 2. Lighthouse + axe-core (local build, `npm start` on port 3100)

Server started with `PORT=3100 npm start` in the background. Note: the server printed `⚠ "next start" does not work with "output: standalone" configuration. Use "node .next/standalone/server.js" instead.` — the app still served correctly (all 6 routes returned HTTP 200), but this is a real production-start mismatch worth flagging for the main review (not chased further here — out of scope for raw measurement).

Lighthouse run via `npx lighthouse <url> --chrome-flags="--headless --no-sandbox"`, mobile = default (simulated mobile throttling), desktop = `--preset=desktop`. Reports saved as JSON under `docs/review/lighthouse/*.report.json` (plus one `.report.html` for home-mobile as a sanity check).

| Page | Mode | Perf | A11y | Best Practices | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|---|
| `/` | mobile | 66 | 96 | 100 | 100 | 6.7s | 0 | 30ms |
| `/` | desktop | 100 | 96 | 100 | 100 | 0.5s | 0.028 | 0ms |
| `/infrastructure` | mobile | 97 | 95 | 100 | 100 | 2.7s | 0.005 | 40ms |
| `/infrastructure` | desktop | 100 | 95 | 100 | 100 | 0.6s | 0.001 | 0ms |
| `/documentation` | mobile | 99 | 86 | 100 | 100 | 2.1s | 0 | 10ms |
| `/documentation` | desktop | 100 | 91 | 100 | 100 | 0.6s | 0 | 0ms |
| `/postmortems` | mobile | 98 | 95 | 100 | 100 | 2.5s | 0 | 10ms |
| `/postmortems` | desktop | 100 | 95 | 100 | 100 | 0.5s | 0 | 0ms |
| `/postmortems/2026-10-05-…powercfg-chaining-bug` | mobile | 98 | 95 | 100 | 100 | 2.3s | 0 | 10ms |
| (same, postmortem detail) | desktop | 100 | 95 | 100 | 100 | 0.5s | 0 | 0ms |
| `/about` | mobile | 98 | 95 | 100 | 100 | 2.3s | 0 | 10ms |
| `/about` | desktop | 100 | 95 | 100 | 100 | 0.5s | 0 | 0ms |

Notes:
- Homepage mobile Performance (66) is a clear outlier, driven entirely by LCP (6.7s vs. 2.1–2.7s on every other mobile page) — the homepage embeds a live cross-origin iframe preview (`x.sacenpapier.org`) plus polling (`/api/backend-latency`, `/api/pod`), which this lab run captured as part of page load cost (see §4).
- **INP**: Lighthouse's lab/single-page run in this CLI version does not expose a standalone Interaction to Next Paint metric (no field data, and no synthetic interaction was scripted for this baseline) — Total Blocking Time (TBT) is reported above as the standard lab proxy. A true INP figure would need CrUX field data or a scripted interaction trace, neither of which this baseline pass does.
- Documentation page has the lowest Accessibility score (86 mobile / 91 desktop) of the set — see axe detail below for the likely cause.

### axe-core (`npx @axe-core/cli <url> --save <path>.json`)

| Page | Violations | Nodes affected | Rule IDs (impact) |
|---|---|---|---|
| `/` | 3 | 88 | `color-contrast` (serious, 66 nodes), `landmark-one-main` (moderate, 2), `region` (moderate, 20) |
| `/infrastructure` | 3 | 56 | `color-contrast` (serious, 39), `landmark-one-main` (moderate, 1), `region` (moderate, 16) |
| `/documentation` | 4 | 112 | `color-contrast` (serious, 50), `landmark-one-main` (moderate, 1), `link-in-text-block` (serious, 45), `region` (moderate, 16) |
| `/postmortems` | 3 | 91 | `color-contrast` (serious, 88), `landmark-one-main` (moderate, 1), `region` (moderate, 2) |
| postmortem detail | 3 | 15 | `color-contrast` (serious, 11), `landmark-one-main` (moderate, 1), `region` (moderate, 3) |
| `/about` | 3 | 47 | `color-contrast` (serious, 44), `landmark-one-main` (moderate, 1), `region` (moderate, 2) |

`color-contrast` is the only `serious`-impact rule firing on every page; `/documentation` additionally fires `link-in-text-block` (serious, 45 nodes) — consistent with its lower Lighthouse Accessibility score above. Full per-violation detail (selectors, failure summaries) is in the saved JSON files under `docs/review/axe/*.json`. Axe's own disclaimer applies: automated testing catches an estimated 20–50% of accessibility issues; manual testing is not covered by this baseline.

---

## 3. Screenshots

Captured via the built-in browser tool (Chromium-based, headless-equivalent) driving the local server at `localhost:3100`, for every combination of EN/FR × light/dark × mobile(375px)/desktop(1280px), saved as real PNGs under `docs/review/screens/`.

- `/`, `/infrastructure`, `/documentation`, `/postmortems`, `/about`: all 8 combinations captured for each (40 files), e.g. `home-en-dark-mobile.png`, `infrastructure-fr-light-desktop.png`.
- Postmortem detail page (`/postmortems/2026-10-05-windows-never-actually-slept-a-silent-powercfg-chaining-bug`): **only 2 of 8 combinations exist** — `postmortem-detail-dark-mobile.png` and `postmortem-detail-dark-desktop.png`. Verified via `read_page`: this page's header has no language-toggle or theme-toggle controls at all (only a "back" link and the cookie-banner dismiss button), unlike every other page template. This is a real UI/navigation inconsistency on the live production template, not a tooling limitation — worth a line item in the main review.
- Total: 42 PNGs, ~11MB, under `docs/review/screens/`.
- Incidental finding while shooting these: the FR/EN and light/dark toggles persist via `localStorage` across client-side navigation, so screenshot automation (or a real visitor) that sets French on one page lands in French on the next page too — expected behavior, noted here only because it tripped up the first capture pass (had to re-shoot `/infrastructure` after discovering stale element references caused clicks to silently miss on the first attempt — fixed by using fresh coordinate-based clicks and verifying state via page text each time).

---

## 4. Network: homepage first-15-seconds load

Measured via the Performance Resource Timing API in a real browser tab against `localhost:3100/`, `performance.getEntriesByType('resource')` + navigation entry, ~15s after navigation.

- **Request count: 22** (incl. navigation).
- **Total transferred: ~292 KB** (sum of `transferSize` across all captured entries; see caveat below).
- Breakdown of the largest entries: two webfonts (22.9 KB, 28.9 KB), several JS chunks (`3g4px251sg85e.js` 70.2 KB, `2z-e6jheq0ftu.js` 44.4 KB, `3mltasbm0cyj9.js` 23.5 KB, plus 6 smaller chunks), one CSS chunk (8.7 KB), one `/_next/image` (1.7 KB), and 5× `/api/backend-latency` polling calls (~0.4 KB each) + 1× `/api/pod` (~0.3 KB).
- **Iframe preview**: the homepage embeds `https://x.sacenpapier.org/` as a cross-origin iframe (visible in the captured request list). Its `transferSize` reads as `0` in the Resource Timing entry — this is standard cross-origin Resource-Timing restriction (the browser hides transfer size for cross-origin subresources without a `Timing-Allow-Origin` response header), **not** evidence the iframe is free. The 292 KB total therefore **undercounts** real page weight by the iframe's actual payload, which this measurement method cannot see from the parent page. A full picture would need either a HAR capture from DevTools Protocol directly, or a `Timing-Allow-Origin: *` header on the iframe's own responses.
- **Backend-latency polling**: confirmed firing repeatedly within the 15s window (5 calls observed) — this is expected/by-design polling behavior per the task's own description of the homepage, not a bug.

---

## 5. Live site checks (`https://sacenpapier.org`)

### Response headers (homepage, via in-browser `fetch()`)

```
status: 200
cache-control: public, max-age=0, s-maxage=60, must-revalidate
content-encoding: zstd
content-type: text/html; charset=utf-8
server: cloudflare
x-nextjs-cache: HIT
x-nextjs-prerender: 1, 1
x-nextjs-stale-time: 300
x-powered-by: Next.js
vary: rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch, Accept-Encoding
alt-svc: h3=":443"; ma=86400
nel / report-to: Cloudflare NEL reporting config present
```

**Not present in the response**: `Content-Security-Policy`, `Strict-Transport-Security` (HSTS), `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`. None of these security headers were observed on the homepage response. (`fetch()` from within a same-origin page exposes all response headers except `Set-Cookie`, so this is a reliable read, not a tooling gap.) `X-Powered-By: Next.js` is present, which is itself a minor info-disclosure header Next.js ships by default unless explicitly disabled.

### Broken links — `npx linkinator https://sacenpapier.org --recurse --concurrency 5`

Scanned 203 links in 3.0s. Reported "49 broken links," but on inspection **all 49 reduce to Cloudflare's email-obfuscation decode endpoint**: 48× `[404] https://sacenpapier.org/cdn-cgi/l/email-protection` (Cloudflare's `/cdn-cgi/l/email-protection` is a non-crawlable JS-rewrite target for obfuscated `mailto:` links — expected to 404 under a plain HTTP crawl, not a real broken link) plus 1× `[403] https://www.cloudflare.com/sign-up?utm_source=email_protection` (Cloudflare's own marketing page blocking the crawler's UA, unrelated to this site). **Effectively 0 real broken links found** across the 203 links linkinator reached via recursive crawl from the homepage.

### robots.txt

```
User-Agent: *
Allow: /
Disallow: /resume.pdf

Sitemap: https://sacenpapier.org/sitemap.xml
```
Sane — allows full crawl, explicitly blocks the resume PDF from indexing, points to the sitemap.

### sitemap.xml

Valid XML, `9386` bytes, lists `/`, `/postmortems`, `/updates` (no `<lastmod>`) plus every individual postmortem and update post with a `<lastmod>` date (sampled; not exhaustively diffed against the content directory — see §6 for the authoritative counts).

### OG image

`<meta property="og:image">` on the homepage resolves to `/opengraph-image?<hash>`, which returns **200, `image/png`**. Sane.

---

## 6. Content inventory (`content/`)

Source: `content/postmortems/*.md` and `content/updates/*.md` (frontmatter + Markdown body), plus `src/data/skills.ts` for the curated "skills" filter list used on `/updates`.

| Item | Count |
|---|---|
| Postmortems (`content/postmortems/*.md`) | **17** |
| Updates (`content/updates/*.md`) | **49** |
| Unique tags across both (frontmatter `tags:` arrays, case-sensitive, deduped) | **102** |
| Skill filters defined (`src/data/skills.ts`, `Skill[]` entries) | **37** |

Words-per-item (via `wc -w` over the raw `.md` files, i.e. includes frontmatter + Markdown syntax, not rendered-text-only):

| Content type | Total words | Items | Avg words/item |
|---|---|---|---|
| Postmortems | 7,301 | 17 | ~429 |
| Updates | 12,481 | 49 | ~255 |

Frontmatter shape is consistent across both content types: `title`, `date`, `duration` (free text, e.g. `~1h`, `5 days`), `tags: [..]`. Postmortem bodies follow a fixed heading structure (`What happened` / `Root cause` / `Fix` / `Prevention`); update bodies follow `What shipped` / `Why` / `How it's set up` / `What's next`.

The `skills.ts` list (37 entries) is deliberately narrower than the 102 raw tags — several tags fold into one skill label (e.g. `ArgoCD`/`FluxCD`/`Kustomize` → "GitOps"), and project-name tags (`x`, `BotWhy`, `PopRoom`, `Aperçu`) are excluded by design (per the file's own doc comment).

---

## What wasn't done / environment gaps

- Per-route "First Load JS" bundle sizes: not available from `next build` output in this Next.js/Turbopack version (see §1). Would need a separate bundle-analysis step.
- A true field/lab INP metric: not exposed by this Lighthouse CLI run (TBT used as proxy, see §2).
- Full iframe payload weight on `/`: cross-origin Resource Timing restrictions hide the `x.sacenpapier.org` iframe's actual transfer size from the parent-page measurement used (see §4).
- `npm audit`'s "1 critical severity vulnerability" was noted but not investigated (out of scope for raw baseline — flagging for the main review to triage).
- The `next start` / `output: standalone` mismatch warning (§2) was observed but not chased further here.

---

## Artifacts produced

- `docs/review/00-baseline.md` — this file.
- `docs/review/screens/*.png` — 42 screenshots (see §3).
- `docs/review/lighthouse/*.report.json` (+ one `.report.html`) — 13 files, full Lighthouse output for all 12 page/mode combinations.
- `docs/review/axe/*.json` — 6 files, full axe-core output per page.

The local server (`PORT=3100 npm start`) was stopped after this pass completed.
