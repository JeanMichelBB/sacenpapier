# Phase 3 — Judge: Final Plan

Inputs read: `review-council-plan.md`, `AGENTS.md`, `00-baseline.md`, all 8 `01-*.md`, all 8 `02-*-critique.md`, `plan-oct-23.md`. Commit `87c1eea`. Date 2026-10-23.

**Status: STOP. Nothing below has been executed. Waiting for Jean-Michel's approval (and his decisions on every item marked JM) before Phase 4.**

---

## 0. Process notes

- **Deviation from the council plan: no second debate round.** The plan says to run a second round "only if more than 5 open conflicts". Phase 2 surfaced 13 conflicts (section 3). The coordinating session skipped round two anyway, because every conflict already has both sides' positions and evidence written out in the `02-*-critique.md` files. The judge resolved them from that record. If Jean-Michel disagrees with any ruling in section 3, that is the place to push back.
- **ID collision.** The a11y reviewer and the architecture reviewer both used `A1`–`A10`. This plan calls the a11y ones **AX1–AX10** and the architecture ones **AR1–AR8**. Other prefixes are unchanged: F = hiring manager, R = recruiter, C = content editor, D = designer, P- = performance, S = security.
- **Judge verification.** Where a finding was about to drive a P1 decision, or two reviewers disagreed on a fact, the judge re-checked source. These checks were read-only (grep, reading files, `npm audit`) and nothing was changed. Results are marked **[judge-verified]** below. Four of them change the plan:
  1. **The "rotate-pod" control is not a write action in this repo.** `rotatePod()` (`src/components/InfrastructureContent.tsx:50-53`) only re-runs `infraApi.pod()`. That is a `GET /api/pod?t=<ts>` (`src/lib/infra.ts`, `pod:`). `src/app/api/pod/route.ts` exports only `GET` and returns `os.hostname()` + `NODE_NAME`. The pod changes because the load balancer picks another replica (`Connection: close`), not because anything gets mutated. It still needs manual checks outside this repo (see U2).
  2. **The critical `npm audit` vuln is in `next` itself**, a production dependency. `package.json:15` pins `"next": "16.3.8"`. `npm audit --omit=dev` reports `next 16.0.0 - 16.4.0`, severity critical: GHSA-2464-fhr4-w9xw (unauthenticated RCE in the Image Optimization API when SVGs are used), GHSA-673q-mjm6-r5xr (RCE in `use cache` functions), GHSA-p3m5-59mp-jv5r (Server Actions DoS). The fix is `next@16.4.3`. Exploitability looks reduced: `next.config.ts` has no `dangerouslyAllowSVG` and `src/` has no `"use cache"`. That has not been proven, and this is the live site's framework. This is now the **#1 item**.
  3. **F3 / P-11 are wrong about production.** `Dockerfile:22-28` copies `.next/standalone` and runs `CMD ["node", "server.js"]`, so production already starts correctly. Only the local `npm start` script (`package.json:8`, `"start": "next start"`) is mismatched. Downgraded from P1 to P3.
  4. **The `/api/infra/*` passthrough (S2) is already leaking more than the UI needs.** The upstream response type `InfraNode` (`src/lib/infra.ts`) includes `tailscale_ip`, `cpu_percent`, `ram_percent`, `uptime_seconds`. The UI never renders `tailscale_ip` (grep finds no use outside `lib/infra.ts`), but `src/app/api/infra/nodes/route.ts` forwards the raw JSON to anyone. That makes S2 a P1 live-exposure fix, not a hypothetical one.
- **New findings from the judge's verification** (evidence included, nobody on the council raised them): `/documentation` is missing from the `noLongCache` list (`next.config.ts:20-28`). Per that file's own comment, that leaves it on Next's 1-year `s-maxage` behind Cloudflare. Separately, `src/app/sitemap.ts:19-21` omits `/about`, `/infrastructure` and `/documentation`.
- **Next.js 16 / `AGENTS.md` API notes for Phase 4.** The baseline confirmed this is a non-standard Next (16.3.8, Turbopack):
  - Middleware is now **`src/proxy.ts`** (`node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`: "Starting with Next.js 16, Middleware is now called Proxy"). The architecture critique's "no middleware exists" is wrong: `src/proxy.ts` *is* the middleware and already does subdomain routing.
  - Before writing CSP, read `node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md`. Before any locale routing, read `.../02-guides/internationalization.md`.
  - `next build` no longer prints First Load JS (baseline §1). The Phase 5 target "First Load JS on `/` lower than baseline" therefore has no baseline number. **Before Batch 2, record the JS bytes for `/`** (Resource Timing sum of `.js` entries, or a bundle analyzer), or that target can't be checked.
  - Reading `cookies()` in the root layout opts every page out of static rendering. That shaped the ruling on conflict #9.

---

## 1. Merge summary

- Raw input: 75 Phase-1 findings (F10, R7, C8, D10, P-12, AX10, S10, AR8) plus 14 "Missed" items from the Phase-2 critiques, so **89 raw items**.
- After merging duplicates and dropping items without evidence: **53 actionable findings in 7 batches**, plus **10 dropped or won't-fix** (section 5).
- Biggest merge clusters:
  - Security headers: F1 + S1 + S8.
  - Duplicate files: AR1 + C8 + F7 + plan.
  - Iframe: P-3 + P-4 + D6 + S6 + plan.
  - `link-in-text-block`: AX3 + F6 + D10 + C4.
  - Missing chrome on the postmortem detail page: D2 + AX9.
  - Cookie banner: S9 + R5 + R6 + D1 + AX6 + plan.
  - FR is client-only: AX1 + P-8 + AR3 + C1 + AX8.
  - Hub monolith: AR2 + AR6 + P-1 + perf-critique code-splitting.

---

## 2. The most urgent item

**U1 + U2 are a live-system risk, not portfolio polish. They come before everything else in this plan.**

- **U1 (do first, today):** bump `next` from 16.3.8 to ≥16.4.3. It's a critical RCE-class advisory on the production framework. Commit `8223edc` bumped `next` for High/Moderate advisories, but this critical one is still open.
- **U2 (Jean-Michel, manual, today):** the security critique asked whether the public "rotate-pod" control is an unauthenticated write. **Within this repo it is not** (see judge-verified #1). Those are the questions this repo can answer. The rest can't be checked from here, so Jean-Michel must confirm by hand:
  1. `curl -X POST/PUT/DELETE https://sacenpapier.org/api/pod` and `/api/infra/{k3s,nodes}` all return 405.
  2. `https://homelabapi.sacenpapier.org` is a **public hostname** (the routes fetch it server-side by public DNS). List every path it serves. Confirm none of them mutate anything (restart, scale, rollout, exec) without auth, and confirm it isn't reachable with a wider surface than `/api/k3s` and `/api/nodes`.
  3. Confirm what `/api/nodes` actually returns live today. Does `tailscale_ip` come through?
  4. Confirm nothing in the k3s deployment gives the site's ServiceAccount write verbs. Use `kubectl auth can-i --list --as=system:serviceaccount:<ns>:<sa>`, the same method as his own 2026-09-13 update.

  If any answer is "yes, it mutates and it's unauthenticated", that becomes a stop-everything fix ahead of U1.

---

## 3. Conflict rulings (one line each)

Priority order applied: **live-system security risk (added by the judge, above everything) > hiring impact > accessibility > performance > maintainability > polish.** Security that is *not* a live risk (recon surface, fingerprinting) ranks with maintainability, unless it's also a hiring signal (a hiring manager can `curl -I` the headers, so they rank as hiring impact).

| # | Conflict | Ruling: who won and why |
|---|---|---|
| 1 | **Iframe:** designer (keep it as the centerpiece; lazy-load + skeleton) vs performance + plan-oct-23 (click-to-load) vs recruiter (less above the fold) | **Split by viewport. Performance wins on mobile, designer wins on desktop.** Mobile LCP is 6.7s and Perf 66 (baseline §2): that's the first impression for most recruiters, and it fails the Phase 5 target. Desktop already scores Perf 100 / LCP 0.5s. Mobile gets a static poster + "Load live preview" button. Desktop gets the lazy iframe with skeleton. Neither cache-busts. |
| 2 | **Topology detail (S7)** vs hiring manager / content editor (specificity is the main asset) | **Line drawn: "how I solved it" stays, "how to reach it today" goes.** *Keep:* root-cause chains, verification commands, metrics, upstream bug links, the CI/CD pipeline shape (it's standard, and visible in public GitHub Actions anyway). *Generalize or remove:* current-state access paths ("LAN fallback address and a WAN SSH fallback", `src/data/homelab.ts:36`; the Mac-SSH-config-as-map line), current SPOF labels stated as present tense ("Single point of failure for most of the homelab", `homelab.ts:34`), and anything naming which host bridges which network. Hiring wins on incident depth. Security wins on live access paths, which add no hiring signal a reviewer would miss. **Final wording is Jean-Michel's call.** |
| 3 | **Architecture diagram (F9, plan)** vs security (aggregated attack map) vs recruiter (too noisy up front) | **All three partly win.** Build it, because hiring impact is real. Make it **logical, not physical**: layers (workloads → k3s → GitOps flow → observability → backups), no hostnames, IPs, access paths or SPOF markers. Put it on `/infrastructure`, not above the fold on `/`. |
| 4 | **"No staging step" disclosure** (S7) vs hiring manager | **Hiring manager wins, with a reframe.** It's a design tradeoff, not an access path. Rewrite it as a deliberate tradeoff with its mitigation (Trivy gate, ArgoCD rollback), not as an admission. Jean-Michel words it. |
| 5 | **Thin updates (C6)** fold/cut vs hiring manager (cadence is signal) | **Hiring manager wins on deletion, content editor wins on form.** Delete nothing. Updates with one-sentence bodies (e.g. `2026-09-14-python-jose-cve-fix.md`) either get the standard 4-heading template or get folded into a themed roundup that keeps the dates. Jean-Michel picks per post. |
| 6 | **F5 default `/updates` to the infra filter** vs hiring manager's own cadence argument | **Rejected as a default.** Hiding product work by default contradicts #5. At most, add an optional "product / platform" visual badge (low priority). |
| 7 | **Plain-language cards (R4)** vs hiring manager (don't simplify the technical writing) | **No real conflict. Both win.** Plain-language subtitles go on the homepage project cards only. `/postmortems`, `/updates` and `/documentation` keep their full technical precision. |
| 8 | **FR body content:** C1 (translate, or hide the toggle) vs AX critique (label it, don't hide it) vs AR critique (locale-keyed schema) vs performance (P-2 first) | **Accessibility wins on UX:** keep the toggle and show a "content available in English only" note in FR mode. **Performance wins on sequencing:** P-2 (slim payload) ships before any FR content. **Architecture loses for now:** a `{en, fr}` body schema is YAGNI until Jean-Michel commits to translating. Whether to translate is his call (L effort, ~20k words). |
| 9 | **Theme/lang flash:** P-7/P-8 (inline script; or middleware cookie) vs AR critique (one shared middleware/cookie mechanism for both) | **Performance wins.** Theme is a client-only preference: a blocking inline `<head>` script keeps every page static. A cookie read in the root layout would make every page dynamic. Lang is a *content* difference, and it's fixed by routing (#10), not by a script. They're different problems, so they get different fixes. |
| 10 | **Crawlable FR:** AX1 (real FR routes now) vs AR critique (fix the routes paradigm first) | **Architecture wins on order, accessibility on the target.** AR2 (real routes, thin `/`) ships first. Then a `[lang]` segment with `generateStaticParams` for `en`/`fr` stays static and fixes `html lang`, the flash and hreflang. Whether to do `[lang]` at all, versus an interim `useLang()` hook, is a **Jean-Michel decision**: with bodies EN-only, FR crawlability buys little until content is translated. |
| 11 | **Type scale (D5)** vs AX critique (it's colour, not size) vs content editor (bigger type on dense text reads worse) | **Accessibility wins.** Fix colour first, because that's what axe's `color-contrast` measures (`#71717b` on `#09090b` = 4.12:1, `axe/home.json`). Size bump only for prose and summaries (`text-sm` minimum). `text-xs` stays for true metadata. Do it in the same pass as the docs trimming (5.1) so density doesn't get worse. |
| 12 | **Cookie banner:** D1 (reserve space) vs performance (CSS-only) vs S9 + recruiter + AX + security critique (remove it) | **Remove it (S9), pending Jean-Michel's sign-off.** One deletion resolves R5, R6, D1, AX6 and the missing `aria-live`. Its own copy says it only stores a theme preference in `localStorage` (`CookieBanner.tsx:30`). If he keeps it, the fallback is a CSS-only reserved slot plus `strings.ts` localization. |
| 13 | **S5 (`/api/pod` discloses pod/node names)** vs hiring manager (the pod badge proves he runs the system) | **Hiring wins. Won't fix.** Node names are already public by design on `/infrastructure` (`InfrastructureContent.tsx:20-22`: `elitedesk`, `oci-node-1`, `oci-node-2`). Pod names are ephemeral. The disclosure adds nothing, and the feature is a top-5 hiring signal. |

Minor disagreements that don't change the plan: content editor vs hiring manager on ranking the `/documentation` prose. Both hold: the substance is strong and the structure is weak, and 5.1 restructures it without cutting substance. The recruiter critique vs D6/F9 on visual complexity is covered by #1 and #3.

---

## 4. Final ranked plan: batches (one commit each)

**Gate after every batch:** `npm run lint && npm run build` pass, screenshot check (EN/FR × light/dark × 375/1280) of touched pages, tick the box here.

**Order changes vs `review-council-plan.md` Phase 4, and why:**
- **Batch 0 (live security) added in front.** U1/U2 are live-risk items that outrank everything.
- **Security headers moved into hygiene (Batch 1).** They're S effort, a hiring signal a reviewer can `curl`, and independent of the rest.
- **Accessibility (Batch 5) moved before content (Batch 6).** Accessibility outranks polish, and it doesn't wait on Jean-Michel. Content does: almost every content item needs his wording, so it goes last and can run in parallel whenever he's ready.
- **Navigation/positioning stays after Structure,** although it has the highest hiring impact. The header is currently copy-pasted 4–5 times (AR3), so doing positioning first means editing every copy and then redoing it. If Jean-Michel wants the recruiter 10-second test fixed sooner, 4.1/4.2/4.4 can ship as a stopgap in `Hub.tsx` only.

Legend: **JM** = needs Jean-Michel's decision or wording before it ships. Sources in [brackets].

### Batch 0: Urgent live-system security (ship today)

| # | Sev | Finding | Evidence | Fix | Effort | JM |
|---|---|---|---|---|---|---|
| - [x] U1 | P1 | `next` 16.3.8 carries critical advisories (RCE in image optimizer with SVG, RCE in `use cache`, Server Actions DoS) [F2, judge-verified] | `package.json:15`; `npm audit --omit=dev` → `next 16.0.0 - 16.4.0` critical; baseline §1 | Bump to `next@16.4.3` (outside the current pinned range, so edit `package.json`). Then lint, build, and smoke-test `/opengraph-image` + `next/image`. Read the Next 16.4 notes in `node_modules/next/dist/docs` after the bump. | S | **Done** — `package.json` bumped, `npm install` clean, build exit 0, `/opengraph-image` smoke-tested 200. |
| - [x] U2 | P1 | Unverified: whether any public control or upstream mutates live infra unauthenticated [security critique, judge-verified partial] | `InfrastructureContent.tsx:50-53` + `lib/infra.ts` → read-only GET; upstream `homelabapi.sacenpapier.org` surface unknown | Manual checklist in section 2 | S | **Resolved, with one residual gap.** JM pointed at the backend source (`homelab-sacenpapier` repo) so the judge's checklist could be verified directly instead of by hand: `backend/app/main.py` + `routers/{nodes,k3s}.py` register only 4 GET routes (`/api/health`, `/api/pod`, `/api/nodes`, `/api/k3s`), no mutating route exists in the FastAPI app at all, and CORS is `allow_methods=["GET"]`. `clients/k3s.py` issues only `GET /api/v1/nodes` and `GET /api/v1/pods` against the k3s API. `k3s/rbac.yaml` scopes the `homelab-dashboard` ServiceAccount to `get/list` on `nodes`/`pods` only — confirmed **live** via `kubectl auth can-i --list --as=system:serviceaccount:default:homelab-dashboard`, exact match to the manifest, and no other ClusterRoleBinding/RoleBinding in the cluster references that SA. The pod's own auto-mounted identity (`default` SA of the `homelab-dashboard` namespace, since the Deployment sets no `serviceAccountName`) has zero resource permissions beyond cluster discovery/healthz. **Residual gap:** the backend doesn't use its pod identity for k8s calls — it uses `K3S_BEARER_TOKEN` from a Doppler-synced secret, and no `kubernetes.io/service-account-token` Secret bound to `homelab-dashboard` exists in-cluster (likely a `kubectl create token` one-off). The judge could not confirm from code/cluster state alone that this token's actual identity is the scoped SA rather than something broader — that's a 1-time check only JM can do (verify in Doppler, or rotate via `kubectl create token homelab-dashboard -n default` and update the secret to be certain going forward). |
| - [x] U3 | P1 | `/api/infra/*` forwards raw upstream JSON, including `tailscale_ip` and host CPU/RAM/uptime the UI never shows [S2, AR critique] | `src/app/api/infra/nodes/route.ts:1-6`, `k3s/route.ts:1-6`; `InfraNode` type in `src/lib/infra.ts` | Map to an allow-listed shape (`name`, `role`, `online`; for k3s `nodes[].{name,status,role}` + `pods`). Shared mapper in `src/lib/`. | S–M | **Done** — both routes now allow-list fields; verified live upstream response no longer includes `tailscale_ip`/`cpu_percent`/`ram_percent`/`uptime_seconds`. |
| - [x] U4 | P1 | No timeout or error handling on outbound fetches. `backend-latency`'s `Promise.all` stalls on one hung upstream. `infra/*` calls `res.json()` unguarded. [S3, P-5 timeout part, AR critique, plan §6] | `src/app/api/backend-latency/route.ts:9-20`; `infra/k3s/route.ts:2-4`; `infra/nodes/route.ts:2-4`; no `AbortSignal` in repo | `src/lib/fetchWithTimeout.ts` using `AbortSignal.timeout(3000)`, used by all 4 routes; return 502/stale JSON on failure | S | **Done** — `src/lib/fetchWithTimeout.ts` added (3s `AbortSignal.timeout`), applied to `backend-latency`, `infra/nodes`, `infra/k3s`; both infra routes now return 502 on failure instead of throwing. |
| - [ ] U5 | P2 | No rate limiting on public `/api/*`, which fan out to 5 homelab hostnames [S4] | No limiter in `src/proxy.ts` or the routes | Cloudflare rate-limit rule on `/api/*` (outside repo). U4 plus the server-side cache in 2.3 cut amplification meanwhile. Not blocking for this batch. | S | JM (Cloudflare config) |

### Batch 1: Repo + ops hygiene

| # | Sev | Finding | Evidence | Fix | Effort | JM |
|---|---|---|---|---|---|---|
| - [x] 1.1 | P1 | 4 byte-identical `" 2"` duplicates, linted twice [AR1, C8, F7, plan §5] | `git status`; `diff` identical (C8, AR1) | Delete them. Add `.gitignore` pattern `* [0-9].*`. Byte-identical means no secret-diff pass is needed (resolves the security critique). | S | **Done** — re-diffed against tracked originals/git HEAD before deleting (still byte-identical), removed all 4, added the `.gitignore` guard. Also found and removed the same pattern recurring live in `node_modules/@types/*` and `.next` during this session's build — looks like an iCloud Drive sync-conflict pattern on this `Documents/`-synced project, not a one-off; worth excluding `node_modules`/`.next` from iCloud sync if this keeps happening. |
| - [ ] 1.2 | P1 | No CSP/HSTS/XFO/nosniff/Referrer/Permissions headers; `X-Powered-By` leaks [F1, S1, S8] | baseline §5; `next.config.ts:15-27` | Add them in `next.config.ts` `headers()` for all routes and set `poweredByHeader: false`. Ship CSP as `Report-Only` first: `frame-src` must allow the 4 project subdomains (`src/proxy.ts:7`) or 2.1 breaks. Follow `.../02-guides/content-security-policy.md`. | S | |
| - [ ] 1.3 | P2 | `/documentation` is missing from `noLongCache`, so it probably gets a 1-year edge cache [judge] | `next.config.ts:20-28` (list has no `/documentation`) | Add it. Better: one `source: "/:path((?!_next).*)"` rule so new routes can't be forgotten. Verify with `curl -I https://sacenpapier.org/documentation`. | S | |
| - [ ] 1.4 | P2 | Sitemap omits `/about`, `/infrastructure`, `/documentation` [judge] | `src/app/sitemap.ts:19-21` | Add the 3 URLs | S | |
| - [ ] 1.5 | P3 | `npm start` uses `next start` against `output: "standalone"`; production (Dockerfile) is correct [F3, P-11, corrected] | `package.json:8`; `Dockerfile:22-28`; baseline §2 warning | Change the `start` script to the standalone server (copy `.next/static` + `public`, same as the Dockerfile) so local Lighthouse matches prod | S | |
| - [ ] 1.6 | P2 | README is `create-next-app` boilerplate [AR8, plan §5] | `README.md:1-20` | Rewrite: what the site is, route map, `content/` conventions, deploy path (Docker → Trivy → Docker Hub → ArgoCD Image Updater → k3s), the `AGENTS.md` caveat | S | JM (review text) |
| - [ ] 1.7 | P3 | Planning notes loose at repo root; unused `public/*.svg` [AR7, plan §5] | Root `ls`; `public/{file,globe,next,vercel,window}.svg`, 0 refs in `src/` (judge grep) | `git mv` `plan-*.md`, `update-backlog.md`, `review-council-plan.md` into `docs/planning/` and delete the 5 SVGs. That also removes SVG files from the image-optimizer path in U1's advisory. | S | |
| - [ ] 1.8 | P3 | Turbopack "dynamic filesystem access traces whole project" × 3 [F10, P-12] | baseline §1; `src/lib/posts.ts:46-47` | Pass the static `CONTENT_DIR` constants instead of a computed `path.join` | M | |

### Batch 2: Performance P1 (target: mobile `/` Perf ≥ 95, LCP < 2.0s)

Before this batch, record the JS bytes for `/` (see section 0) to give Phase 5 a First Load JS baseline.

| # | Sev | Finding | Evidence | Fix | Effort | JM |
|---|---|---|---|---|---|---|
| - [ ] 2.1 | P1 | Iframe eager-loads, cache-busts with `Date.now()` on every mount, has no skeleton and no `sandbox` → mobile LCP 6.7s [P-3, P-4, D6, S6, plan §6] | `src/components/ProjectPreview.tsx:101-104,118-137`; baseline §2, §4 | Per ruling #1: mobile gets a poster + "Load live preview"; desktop gets `loading="lazy"` + skeleton. Cache-bust only on an explicit refresh. Add `sandbox="allow-scripts allow-same-origin allow-forms"` and test each app. Add a visible "Preview" affordance on the card (plan §7). | M | JM (poster screenshots per app) |
| - [ ] 2.2 | P1 | Full `sections` bodies of 66 posts serialized into the client `Hub` but never read [P-2, plan §6] | `src/app/page.tsx:5-8`; `src/lib/posts.ts:5-13`; `PostCard.tsx:9-29` | `getAllPostsSummary()` returning `slug,title,date,tags,summary,duration` | S | |
| - [ ] 2.3 | P2 | Latency poll fires at mount, every 10s forever, even in hidden tabs [P-5, plan §6] | `src/components/Hub.tsx:144-170`; baseline §4 (5 calls/15s) | Defer the first poll until after load. Pause on `document.hidden`. Cache the route result server-side ~10s. Timeouts are already done in U4. | S | |
| - [ ] 2.4 | P2 | `body { font-family: Arial }` overrides Geist, which is still downloaded (~52 KB) [P-6, plan §6] | `src/app/globals.css:26-31`; `layout.tsx:7-15`; baseline §4 | Apply `--font-sans` to body (keep Geist) or drop the Geist imports. It's a visible change. | S | JM (which font) |
| - [ ] 2.5 | P2 | Light-theme users get a dark flash (`dark` hardcoded, removed in `useLayoutEffect`) [P-7, plan §6] | `src/app/layout.tsx:50`; `src/components/ThemeInit.tsx:1-10` | Blocking inline `<head>` script (ruling #9); delete `ThemeInit` | S | |
| - [ ] 2.6 | P3 | 365.6 KB / 135.2 KB source PNGs for a 36px icon; filename has a space; OG route reads the raw PNG [P-9, plan §6] | `public/img/shopping-bag.png`, `public/img/Paper Bag Crush.png`; `Hub.tsx:498,510`; `opengraph-image.tsx:9` | Re-export at ≤128px PNG/WebP and rename `paper-bag-crush.*`. The served weight is already 1.7 KB, so this is mostly build/OG cost. | S | |
| - [ ] 2.7 | P3 | `max-age=0` makes every navigation revalidate [P-10] | baseline §5 | Optional: `max-age=30` next to `s-maxage=60` | S | optional |

### Batch 3: Structure (one paradigm, shared chrome)

| # | Sev | Finding | Evidence | Fix | Effort | JM |
|---|---|---|---|---|---|---|
| - [~] 3.1 | P1 | `/` is a 634-line client SPA (`activeView`) that duplicates the real routes `/about`, `/infrastructure`, `/documentation`; every view ships in one bundle [AR2, AR6, P-1, perf critique, plan §5] | `src/components/Hub.tsx:1,48,544,558,572`; `wc -l` = 634 | Thin `app/page.tsx` landing. Shared root-layout header + nav with `<Link>`. Hub split into server chrome + client leaves (`ThemeToggle`, `LanguageToggle`, latency, pod badge, crush). Removes the scroll-restore/sessionStorage hacks. Target folder structure: `01-architecture.md`, "Proposed Target Folder Structure". | L | **Partial.** Extracted a shared `SiteHeader` (identity/nav/social/toggles) used by `Hub.tsx` and all 4 `*PageClient` components, cutting ~180 lines of duplication — but `Hub.tsx`'s internal `activeView` SPA state machine and the scroll-restore/sessionStorage hacks are untouched; the full real-routes migration (thin `page.tsx`, splitting Hub into server chrome + client leaves) is still open and still L effort. |
| - [x] 3.2 | P1 | Postmortem detail page has no lang/theme toggles or contact icons [D2, AX9, plan §5] | `src/app/postmortems/[slug]/page.tsx:5,51` (only `<BackLink/>`); baseline §3 (2/8 screenshots possible) | Falls out of 3.1's shared header. Apply it to `updates/[slug]` too. | S (after 3.1) | **Done** — both `[slug]` templates now render `SiteHeader` via a small `DetailPageHeader` client wrapper (back/history link + social + lang/theme), verified live on both routes. |
| - [x] 3.3 | P2 | lang state + `localStorage` effect copy-pasted ×5; `html lang="en"` hardcoded; English flash; FR not crawlable, no hreflang [AR3, P-8, AX1, plan §5] | `Hub.tsx:131`, `InfrastructurePageClient.tsx:17`, `AboutPageClient.tsx:17`, `DocumentationPageClient.tsx:17`, `PostListPage.tsx:30`; `layout.tsx:45-50`; no `hreflang` in `src` | Per ruling #10, either (a) a `[lang]` segment with `generateStaticParams` + `alternates.languages` (read `.../02-guides/internationalization.md`), or (b) an interim `useLang()` hook | M (b) / L (a) | **Done, option (b).** Extracted `src/lib/useLang.ts`, used everywhere the duplicated effect lived (5 call sites → 1). This was flagged as a JM decision (a vs b) in the original ruling; (b) was chosen here as the lower-risk interim step since real routes (3.1) aren't done yet — **(a), the `[lang]` segment for true FR crawlability, is still open** and depends on 3.1 landing first per ruling #10. |
| - [x] 3.4 | P2 | No `<main>` landmark anywhere → `landmark-one-main` + `region` on all 6 pages [AX4] | `grep "<main"` = 0; all 6 `docs/review/axe/*.json` | One `<main>` in the shared layout from 3.1 | S | **Done** on all 6 pages (one `<main>` each, inside `Hub.tsx` and each `*PageClient`/detail template) even though 3.1's shared layout isn't built yet. |
| - [ ] 3.5 | P2 | No `Pill`/`Pager` primitives (16 inline pill copies; pager duplicated top and bottom); page size 10 vs 6 [AR4, D8, plan §5] | `grep "rounded-full.*px-3"` = 16; `PostListPage.tsx:15` vs `Hub.tsx:190` | `components/ui/Pill.tsx`, `ui/Pager.tsx`, one `PER_PAGE` | M | |
| - [ ] 3.6 | P2 | `#FF8225` hardcoded 20+ times across 6 files [AR5, plan §5] | `ProjectCard.tsx:26`, `Hub.tsx` ×8, `PostListPage.tsx` ×2, `HomelabDocsContent.tsx` ×4 | `--color-brand` in the `@theme` block of `globals.css` → `bg-brand`/`text-brand` | M | |
| - [ ] 3.7 | P3 | `HomelabDocsContent.tsx` (458 lines, client) mixes scroll-spy, sidebar, data; imports 29 KB `homelab.ts` client-side [AR6, perf critique] | `wc -l`; `"use client"` + `src/data/homelab.ts` import | Extract `useScrollSpy`; render the item list server-side and pass it down | M | |
| - [ ] 3.8 | P3 | Lint exits 1: 17 errors, 4 warnings (mostly `set-state-in-effect`) [F8] | baseline §1 | Most disappear with 1.1, 3.3, 2.5. Fix the remainder. Gate: `npm run lint` exits 0 by the end of this batch. | M | |

### Batch 4: Navigation + positioning (highest hiring impact; most items need JM)

| # | Sev | Finding | Evidence | Fix | Effort | JM |
|---|---|---|---|---|---|---|
| - [x] 4.1 | P1 | No name above the fold; H1 is the domain [R1, plan §1] | `Hub.tsx:494-505`; `home-en-light-*.png` | Full name in the header, domain as subtitle | S | **Done** — "Jean-Michel Bérubé" is now the H1 in `SiteHeader`'s home variant, `sacenpapier.org` moved to a small caption underneath. **Please confirm this is the name form you want published** (no title/middle name/accents issues). |
| - [~] 4.2 | P1 | No stated role. "Full-stack" reads as a filter pill. About has no timeline or framing. Metadata says "web apps, infra, and experiments". [R2, F4, plan §1] | `strings.ts:5,27,38-43`; `AboutContent.tsx:1-57`; `layout.tsx:19-41` | One-line role statement next to the name, an About intro line, and a metadata description, all saying the same thing. The council does **not** pick the role: the recruiter's example says "Full-stack developer" and plan-oct-23 says "DevOps / Platform engineer". The content evidence (17 postmortems, mostly infra updates) leans platform. | S | **Partial — role line done, About/metadata not yet.** Added "DevOps / Platform Engineer" under the name in `SiteHeader`, using the exact wording from `plan-oct-23.md` §1 (your own draft, not invented). Also rewrote the tagline to foreground the platform (k3s/GitOps/observability, already-documented facts, no new claims). Also updated the `layout.tsx` metadata description to the role + platform framing. **The About page's bio paragraphs still say "I'm a bilingual full-stack developer..." — not touched, since that's first-person biographical copy I didn't want to rewrite without your sign-off. Confirm the role wording, then I can carry it through there too.** |
| - [~] 4.3 | P1 | Nav confusion: two "Documentation" tabs; "Full-stack" breaks the noun pattern; the Updates filter uses `documentationNav`; "Post-mortems" vs "Postmortems"; no "start here" hierarchy [D3, D4, D9, R7, plan §4] | `strings.ts:11-14,70-73`; `Hub.tsx:202` (`["documentation", t.documentationNav]` labels the Updates filter, judge-verified); `Hub.tsx:530-581` | Rename to plan-oct-23's proposal: **Home \| Platform \| Writing \| About** (FR: Accueil \| Plateforme \| Écrits \| À propos). Platform = Infrastructure + Documentation; Writing = Postmortems + Updates. Use `t.updates` for the filter. Pick one spelling. | M | **Partial — label/bug fixes done, route merge not.** Fixed the judge-verified `documentationNav`-on-Updates-filter bug (now uses `t.updates`). Renamed the "Full-stack" pill to "Projects" (noun pattern) and the garbled "Postmortems/Documentation" pill to "Writing" ("Écrits" FR). **Did not** merge Infrastructure+Documentation into one "Platform" route or Postmortems+Updates into one "Writing" route — that's a real information-architecture change (URLs, sitemap, existing links) beyond a label rename, left for a dedicated pass. |
| - [x] 4.4 | P1 | Contact is icon-only; no text CTA [R3] | `Hub.tsx:519-525` (icons have `aria-label`, judge-verified, so this is a visual problem, not an a11y one) | Visible "Contact" / "Email me" text link next to the icons | S | **Done** — visible "Contact" text link (mailto) next to the icon row in `SiteHeader`, shown on all pages ≥ sm breakpoint (hidden on narrow mobile alongside the icon-only row, same as before, to avoid crowding; the mailto icon still covers that case on mobile). |
| - [ ] 4.5 | P1 | No CV/résumé path above the fold [recruiter critique, plan §3] | Header icons only. `src/app/robots.ts:8` already disallows `/resume.pdf`, yet there's no `public/resume.pdf` (judge-verified). | Add a CV link if he wants one. **The council does not decide whether to publish a CV.** | S | **JM (yes/no; supply the PDF)** |
| - [ ] 4.6 | P1 | Strongest material is buried; homepage leads with app cards + iframe [plan §1, §3; F top-5] | Hiring manager's top 5: Longhorn leak postmortem, SA scoping update, live dashboard, shutdown cascade postmortem, homelab docs | Homepage order: who → platform at a glance (live stats strip) → 3 featured postmortems with a one-line lesson each → apps | M | **JM (pick 3 + lesson lines)** |
| - [ ] 4.7 | P2 | Project cards lead with jargon and tech badges [R4] | `Hub.tsx:359-368`; `strings.ts:9-14` | Plain-language subtitle first on **homepage cards only** (ruling #7) | S | **JM (one line per app)** |
| - [ ] 4.8 | P3 | "A few platform numbers" (services, uptime %, postmortems written) [plan §3] | The live API already feeds `/infrastructure` stats (`InfrastructureContent.tsx:62-67`) | Reuse the stat strip in 4.6. Only show numbers that are measured live; don't hand-enter uptime % (that's the C2 staleness problem again). | S | JM |

### Batch 5: Accessibility + polish (no JM blockers except 5.7)

| # | Sev | Finding | Evidence | Fix | Effort | JM |
|---|---|---|---|---|---|---|
| - [ ] 5.1 | P1 | `color-contrast` (serious) on all 6 pages, 11–88 nodes [AX2, D5 contrast part, plan §7] | `docs/review/axe/*.json`, e.g. `#71717b` on `#09090b` = 4.12:1 | Ruling #11: secondary text on dark → `zinc-400`, on light → `zinc-600`. Re-run axe. | M | |
| - [ ] 5.2 | P1 | `link-in-text-block` (serious, 45 nodes) on `/documentation`: links only underline on hover [AX3, F6, D10, C4] | `axe/documentation.json`; `HomelabDocsContent.tsx` `hover:underline text-[#FF8225]`, `linkify()` at `:7-16` | Underline by default (`underline underline-offset-2`) | S | |
| - [ ] 5.3 | P2 | `text-xs`/`text-[11px]` used for prose and summaries [D5, plan §7] | `grep -c text-xs`: Hub 20, Infra 13, HomelabDocs 8, PostList 7; `text-[11px]` at `Hub.tsx:252,269,283,298,454` | `text-sm` minimum for prose and summaries; keep `text-xs` for timestamps and metadata (ruling #11) | M | |
| - [ ] 5.4 | P2 | Filter input removes its outline with no replacement; no `focus-visible` anywhere [AX5] | `HomelabDocsContent.tsx:330` | Global `focus-visible:ring-2 ring-brand` on interactive elements | S | |
| - [ ] 5.5 | P2 | Untranslated chrome: PodBadge ("Served by Kubernetes pod", "Refresh pod"), status labels Live/WIP/Archived, the reroute button `title` [AX7, plan §7] | `PodBadge.tsx:23,32`; `ProjectPreview.tsx:16-18`, `ProjectCard.tsx:14-15`; `InfrastructureContent.tsx:123` | Route them through `strings.ts` | S | |
| - [ ] 5.6 | P2 | `/documentation` mobile sidebar toggle is an invisible sliver at `left: 0` [D7] | `HomelabDocsContent.tsx:213-222`; `documentation-en-light-mobile.png` | Inset it, give it a ≥44px hit target with a background and an `aria-label` | S | |
| - [x] 5.7 | P3 | Two clickable logo buttons (desktop + mobile copies) for the paper-bag easter egg [plan §7] | `Hub.tsx:496-512` (`hidden sm:inline-flex` button + mobile copy) | Keep one element with responsive sizing. It also loses the duplicate `next/image` work. | S | **Done** — `SiteHeader`'s home variant has a single logo button (32px, same across breakpoints) instead of the desktop/mobile pair. Kept the easter egg itself since nobody asked to remove it. |
| - [ ] 5.8 | P3 | `BackLink` is a `<button>` even when its fallback navigates to `/` [AX10] | `src/components/BackLink.tsx:9-17` | Optional: render `<Link href="/">` when there's no history | S | optional |

### Batch 6: Content (every item is a Jean-Michel decision; can run in parallel any time)

Nothing in this batch gets drafted as final copy without his approval. The council proposes edits; it does not add facts about his experience.

| # | Sev | Finding | Evidence | Proposal | Effort | JM |
|---|---|---|---|---|---|---|
| - [~] 6.1 | P1 | `/documentation` entries are 545–923-char single paragraphs **and** publish live access paths and SPOFs [C3, S7, plan §2 ×2] | `src/data/homelab.ts:34,36,45,62,68,92,151,166,225,297,341` | One pass over `homelab.ts`: restructure each item into what / why / one decision (keep the specifics), and apply ruling #2's line on access paths and SPOFs. | M | **Partial — security line applied, paragraph restructure not done.** Applied ruling #2 directly: dropped the LAN/WAN fallback addresses and the "only device with SSH to every host + both OCI API keys" framing on the Mac/EliteDesk/Gaming-PC entries, softened the present-tense SPOF label on EliteDesk, and reframed "no staging step" per ruling #4 (kept as a stated tradeoff with its mitigations, not an admission) — all root-cause chains, verification commands and metrics left untouched. **Did not** shorten the long paragraphs into a what/why/decision format — that's a voice/length call I didn't want to make unilaterally across ~15 entries. **Please skim `src/data/homelab.ts` for anything I should have redacted differently or restored** — the security-vs-depth line is still ultimately your call. |
| - [x] 6.2 | P2 | Media-stack mentions (qBittorrent, *arr, Gluetun, Seerr) [plan §2] | 3 hits in `src/data/homelab.ts` (judge grep, e.g. `:36` Gluetun); Jellyfin also appears in postmortems (e.g. `2026-07-31-longhorn-instance-manager-leak.md:10`) | Remove from docs, or generalize to "media services". Postmortem mentions are probably fine as workload context. | S | **Done** — generalized to "media stack"/"media services" in `homelab.ts` (Homepage widgets, nginx-proxy routing). Left the postmortem mention alone, as the finding suggested. |
| - [ ] 6.3 | P2 | No single architecture picture [F9, plan §3] | `InfrastructureContent.tsx:78-91` (only a 4-node flow) | Logical diagram per ruling #3 (no hosts, IPs or access paths), on `/infrastructure` | M | **JM (content + level)** |
| - [ ] 6.4 | P2 | Post and docs bodies are EN-only while the FR toggle implies a translation [C1, AX8, plan §3] | `src/lib/posts.ts` `Post` type (no locale); `DocumentationPageClient.tsx:54` (no `lang` prop to `HomelabDocsContent`) | Ruling #8: show an "English only" note in FR mode now; translating is a separate L-effort decision | S (note) / L (translate) | **JM (translate or not)** |
| - [x] 6.5 | P2 | Skill chip wall (37 flat chips on `/about`) and tag sprawl (102 tags, many singletons; up to 6 chips per card) [C5, C7, plan §2] | `src/data/skills.ts:20-57`; `AboutContent.tsx:43-53`; baseline §6 | Group into ~10 categories (plan-oct-23's list is a starting point). Cap tag chips per card at 3 + "+N". Remove the chip wall from the homepage. | S–M | **Done, using plan-oct-23's exact category list.** `skills.ts` now has 10 entries (Kubernetes, GitOps, CI/CD, Observability, Security, Networking, Storage, Infrastructure as Code, Databases, App Development) instead of 37 — this also fixes the `/about` chip wall automatically since it renders from the same list. Removed the homepage skill-chip row entirely (plan-oct-23 §2). **Did not** cap tag chips per post card at 3+"+N" — separate from this list, lower priority, left for later. A few tag→category assignments are judgment calls (noted in a comment in `skills.ts`) — rebalance if you disagree. |
| - [ ] 6.6 | P2 | Thin updates dilute the feed [C6, F5] | `content/updates/2026-09-14-python-jose-cve-fix.md` (one-sentence body); `2026-09-15-auto-login-demo-user-on-x.md` (113w); `2024-10-17-apercu-password-reset.md` (123w) | Ruling #5: expand or fold into dated roundups; delete nothing | M | **JM (per post)** |
| - [x] 6.7 | P2 | Hand-entered `commits`/`endpoints` labelled "from the real repo" will go stale [C2, plan §2] | `src/data/projects.ts:14-16,32-33,47-48,62-63,77-78`; rendered at `Hub.tsx:420,424` | Generate at build time (GitHub API), add an "as of <date>" caption, or remove | M / S | **Minimal fix applied, not the full options.** Added a `* snapshot, not live — pulled from the repo by hand` footnote under those two stats, since they sit right next to genuinely live response-time/status numbers and the juxtaposition was the real trust problem. Did not build the GitHub-API build-time generation (more moving parts, a build-time network dependency) or remove the numbers outright — both still open if you'd rather have one of those instead. |
| - [x] 6.8 | P2 | Cookie banner: unnecessary for `localStorage` theme pref; English-only; overlaps content on mobile and desktop; no `aria-live` [S9, R5, R6, D1, AX6, AX critique, plan §2] | `CookieBanner.tsx:9,26-37`; `globals.css:50-55`; `home-*-mobile.png` | Ruling #12: remove the component and `has-cookie-banner` CSS | S | **Done** — removed `CookieBanner.tsx`, its import/usage in `layout.tsx`, and the `has-cookie-banner` CSS rule. This was the strongest-consensus item in the whole review (5 separate findings), but it's still your legal call if you'd rather keep a banner — easy to revert from git history. |
| - [ ] 6.9 | P3 | Pre-2026 app updates are low value [plan §2] | `content/updates/2024-*.md` (e.g. `2024-10-17-apercu-password-reset.md`) | Optional "Archive" grouping on `/updates`; do not delete | S | **JM** |

**Ranking across batches (by impact, regardless of batch order):** U1 > U2 > U3 > U4 > 2.1 (mobile LCP) > 4.2 / 4.1 / 4.6 (positioning) > 1.2 (headers) > 5.1 / 5.2 (contrast) > 4.3 (nav) > 3.1 (routes) > 6.1 (docs + redaction) > 2.2 > 1.1 > everything else in table order.

---

## 5. Dropped / won't fix (with reason)

| Item | Reason |
|---|---|
| S5 `/api/pod` discloses pod/node names | Won't fix (ruling #13): node names are already public by design; the feature is a hiring signal. |
| S10 `?notfound=` reflection in `src/proxy.ts:10-18` | No sink renders it (S10's own evidence). Note only: keep it text-only if it's ever displayed. |
| F3 "production runs `next start`" | Factually wrong (`Dockerfile:28`). Reframed as 1.5 (local script only, P3). |
| P-3 | Tracking row, no fix of its own. Merged into 2.1. |
| AX critique: header icon links may lack accessible names | Verified false: `GithubLink.tsx:7`, `LinkedinLink.tsx:7`, `EmailLink.tsx:5` all have `aria-label`. |
| Content-editor critique: Longhorn follow-up isn't cross-linked | The recurrence is *inside* the same postmortem (`duration: ... recurred 55 days later`, `2026-07-31-longhorn-instance-manager-leak.md:4`), and the file links to the June 19th incident (`:10`). The premise doesn't hold. |
| AR critique: "no middleware exists; consolidate into one" | `src/proxy.ts` *is* Next 16 middleware (renamed). Headers belong in `next.config.ts` `headers()` (static, cheap), not per-request proxy logic. |
| Security critique: diff duplicate files for secrets | Already satisfied: the files are byte-identical to tracked files (C8, AR1 `diff`). |
| Hiring-manager critique: recency signal, links from postmortems to fixing commits/PRs | No file:line or measurement, so dropped per the evidence rule. **Parked as JM ideas** (both are additive content choices). |
| Designer critique: no hover/active state system | No file:line or screenshot. Dropped. 3.5 (`Pill` primitive) is the natural place to add states if he wants them. |

---

## 6. Reconciliation with `plan-oct-23.md`

| plan-oct-23 item | Verdict | One-line reason / mapping |
|---|---|---|
| §1 Name + role in header | **Confirmed** | R1, R2 → 4.1, 4.2. The role wording is JM's call (council evidence leans platform; recruiter example said full-stack). |
| §1 Rewrite tagline around the platform | **Adjusted** | Folded into 4.2; JM writes it. The council adds the rule "no invented years or employers". |
| §1 Update `layout.tsx` metadata + About intro | **Confirmed** | F4 → 4.2. |
| §1 Homepage order: who → stats → 3 postmortems → apps | **Confirmed** | → 4.6, plus ruling #1 (the iframe stops leading on mobile). |
| §2 Skill filter to ~10, remove the homepage chip wall | **Confirmed** | C5, C7 → 6.5; category list is JM's. |
| §2 Documentation paragraphs to 2–3 sentences | **Adjusted** | → 6.1: restructure into what / why / decision **without cutting specifics** (the hiring manager ranks this content top-5). 2–3 sentences is a guide, not a hard cap. |
| §2 Remove media stack from docs | **Confirmed (JM)** | → 6.2; postmortem mentions probably stay. |
| §2 Reduce network detail (WAN SSH, LAN fallback, SPOF) | **Confirmed, line sharpened** | S7 → ruling #2 + 6.1. "No staging" gets reframed, not removed (ruling #4). |
| §2 Hide pre-2026 updates behind Archive | **Adjusted (downgraded P3)** | → 6.9; optional grouping, never deletion (ruling #5 cadence argument). |
| §2 Hardcoded commits/endpoints | **Confirmed** | C2 → 6.7. |
| §2 Remove cookie banner | **Confirmed** | S9 + 5 corroborating findings → 6.8 (JM confirms). |
| §3 Feature 3 best postmortems | **Confirmed** | → 4.6; hiring manager's top 5 gives candidates. |
| §3 One architecture diagram | **Adjusted** | → 6.3: logical-level only, on `/infrastructure`, not the homepage (rulings #3 and recruiter). |
| §3 CV/résumé link | **Confirmed (JM)** | Recruiter critique independently raised it → 4.5. `robots.ts` already anticipates `/resume.pdf`. |
| §3 Platform numbers | **Adjusted** | → 4.8: live-measured numbers only; no hand-entered uptime %. |
| §3 Documentation EN-only: translate or note | **Confirmed** | C1/AX8 → 6.4; note now, translation is JM's call (ruling #8). |
| §4 Rename nav: Home \| Platform \| Writing \| About | **Confirmed (JM approves)** | D3, D4, D9, R7 → 4.3. |
| §4 Fix `documentationNav` used for the Updates filter | **Confirmed** | Judge-verified at `Hub.tsx:202` → 4.3. |
| §5 Delete 4 Finder duplicates | **Confirmed** | AR1, C8, F7 → 1.1. |
| §5 Tabs vs routes: real routes + shared header | **Confirmed** | AR2, P-1 → 3.1, 3.2. |
| §5 Split `Hub.tsx` | **Confirmed** | AR6, P-1 → 3.1. |
| §5 `useLang()` or `[lang]` segment | **Confirmed, sequenced** | → 3.3, after 3.1 (ruling #10); a vs b is JM's call. |
| §5 `<Pill>` + pager components | **Confirmed** | AR4, D8 → 3.5. |
| §5 `#FF8225` → theme token | **Confirmed** | AR5 → 3.6. |
| §5 README rewrite, delete unused SVGs, move plan files | **Confirmed** | AR7, AR8 → 1.6, 1.7. The unused SVGs also matter for U1's SVG advisory. |
| §6 P1 iframe → screenshot + "Load live preview" | **Adjusted** | → 2.1: click-to-load on **mobile only**; desktop keeps the lazy live iframe (ruling #1). Adds `sandbox` (S6). |
| §6 P1 Slim Hub payload | **Confirmed** | P-2 → 2.2. |
| §6 P2 Polling pause + server cache + timeout | **Confirmed, upgraded** | The timeout part is now P1 in Batch 0 (U4), because of S3's hung-request risk. |
| §6 P2 Logo PNGs | **Adjusted (downgraded P3)** | P-9 shows the *served* size is already 1.7 KB → 2.6. |
| §6 P2 Arial override | **Confirmed** | P-6 → 2.4 (JM picks the font). |
| §6 P3 Theme flash inline script | **Confirmed, upgraded P2** | P-7 → 2.5; cheap, and needed for the Phase 5 "no flash" target. |
| §6 P3 Memoize `getPost()` | **Removed** | No reviewer found evidence of request-time cost (all post routes are SSG per baseline §1). Revisit only if routes become dynamic. |
| §7 Contrast | **Confirmed, upgraded P1** | AX2 (axe serious on every page) → 5.1. |
| §7 Too much `text-xs` | **Confirmed, scoped** | D5 → 5.3: prose and summaries only (ruling #11). |
| §7 Status labels + cookie banner not translated | **Confirmed / partly obsolete** | Status labels → 5.5. The cookie banner becomes obsolete if 6.8 removes it. |
| §7 Two clickable logos | **Confirmed** | Judge-verified `Hub.tsx:496-512` → 5.7. |
| §7 Project card "Preview" affordance | **Confirmed** | Merged into 2.1. |
| §7 Lighthouse before/after Update post | **Confirmed** | Already Phase 5 of the council plan. |
| Suggested order (cleanup → perf → nav+routes → content → polish) | **Adjusted** | New order: **0 live security → 1 hygiene (+ headers) → 2 perf → 3 structure → 4 nav/positioning → 5 a11y → 6 content (parallel, JM-gated)**. Live risk goes first, accessibility is lifted above content, nav is split out from routes (see section 4). |
| *Not in plan-oct-23* | **New** | U1 (Next critical advisory), U2 (rotate-pod/homelabapi verification), U3 (`tailscale_ip` passthrough), U5 (rate limit), 1.2 (security headers), 1.3 (`/documentation` 1-year cache), 1.4 (sitemap gaps), 1.5 (start script), 1.8 (Turbopack warning), 3.4 (`<main>`), 5.2 (link underline), 5.4 (focus ring), 5.6 (mobile sidebar toggle). |

---

## 7. Decisions needed from Jean-Michel before Phase 4 (consolidated)

1. **U2: run the live verification checklist** (section 2) today.
2. **Role statement** (4.2): DevOps / Platform, Full-stack, or a hybrid, plus the exact wording. No invented facts.
3. **Name form** in the header (4.1).
4. **CV link: yes or no** (4.5). If yes, supply the PDF and decide whether `robots.ts` keeps disallowing it.
5. **The security-vs-depth line** (6.1, 6.2, ruling #2/#4): approve the judge's line or move it.
6. **Nav labels** (4.3).
7. **The 3 featured postmortems and their one-line lessons** (4.6).
8. **Locale approach** (3.3): `[lang]` segment (L) or `useLang()` hook (M). Translate bodies or not (6.4).
9. **Cookie banner removal** (6.8).
10. **Font** (2.4), **easter-egg logo** (5.7), **commits/endpoints handling** (6.7), **skill categories** (6.5), **thin updates, per post** (6.6), **Archive** (6.9).
11. **Cloudflare rate-limit rule** (U5): outside the repo.
