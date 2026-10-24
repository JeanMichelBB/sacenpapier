# Phase 1 — Code Architecture Review (Next.js 16)

Reviewer scope: duplicate files, routing paradigm, shared primitives, theme tokens, repo hygiene. Evidence-based only; see `00-baseline.md` for build/lint baseline.

## Findings

| ID | Severity | Area | Problem | Evidence | Fix | Effort |
|---|---|---|---|---|---|---|
| A1 | P1 | Duplicate files | Four untracked `" 2"`-suffixed files are byte-identical copies of tracked files (macOS "keep both" artifacts), not intentional variants. They are linted and built alongside the originals, doubling lint-error surface. | `diff src/app/documentation/page.tsx "src/app/documentation/page 2.tsx"` → identical; same for `DocumentationPageClient 2.tsx`, `HomelabDocsContent 2.tsx`, `data/homelab 2.ts`. `docs/review/00-baseline.md:14` confirms the duplicates "are also linted and carry the same issues". | `git rm` all four `" 2"` files; add a `.gitignore`/pre-commit guard for filenames matching `" [0-9]\.\w+$"`. | S |
| A2 | P1 | Routing paradigm | `/` is not a thin route — `Hub.tsx` (634 lines) owns an `activeView` state machine (`projects\|about\|infrastructure\|homelabDocs\|docs`) that re-implements content also served by the real routes `/about`, `/infrastructure`, `/documentation`, duplicating navigation/view logic in two places (client-side tab switch vs. App Router segments). | `src/components/Hub.tsx:48` (`activeView` state), `:544,558,572` (toggles into `infrastructure`/`homelabDocs`/`docs` views); compare to real routes `src/app/about/page.tsx`, `src/app/infrastructure/page.tsx`, `src/app/documentation/page.tsx`. | Pick one paradigm: either make `/` a lean landing page that links to the real routes (preferred — routes already exist, give SSG/metadata/code-splitting per view), or delete the standalone routes and keep Hub as the sole SPA shell. Mixed state currently means content/logic must be kept in sync in two places. | L |
| A3 | P2 | Duplicated lang/header logic | Identical `useState<Lang>` + `localStorage.getItem("lang")` + `document.documentElement.lang` effect block is copy-pasted across 5 page-client components with no shared hook. | `grep -rn "const saved = localStorage.getItem" src/components` → hits in `Hub.tsx:131`, `InfrastructurePageClient.tsx:17`, `AboutPageClient.tsx:17`, `DocumentationPageClient.tsx:17`, `PostListPage.tsx:30` (plus the duplicate `" 2"` file). Same pattern also triggers `react-hooks/set-state-in-effect` 17× per `00-baseline.md:14`. | Extract a `useLang()` hook (e.g. `src/lib/useLang.ts`) encapsulating state + localStorage sync + `<html lang>` side effect; replace all 5 call sites. Also fixes several of the 17 lint errors at once. | M |
| A4 | P2 | Shared UI primitives | No reusable `Pill`/tag component exists. `pillClass`/pill-styled buttons are hand-rolled inline inside `HomelabDocsContent.tsx` only (not exported), while visually identical `rounded-full px-...` pill markup is duplicated ad hoc elsewhere. | `grep -rln "function Pill\|pillClass" src/components` → only `HomelabDocsContent.tsx` (+ its `" 2"` duplicate); `grep -rn "rounded-full.*px-3"` → 16 separate inline occurrences across components. | Extract `Pill`/`Tag` into `src/components/ui/Pill.tsx`; replace inline instances. | M |
| A5 | P2 | Theme tokens | Brand color `#FF8225` is hardcoded as a literal hex in at least 6 component files (20+ occurrences) instead of a CSS variable, even though `globals.css` already defines a `:root` token block. Only 1 file in the whole component tree uses `var(--...)`. | `grep -rno "#[0-9A-Fa-f]{6}" src/components | sort | uniq -c` → `#FF8225` in `ProjectCard.tsx:26`, `Hub.tsx` (8×), `PostListPage.tsx` (2×), `HomelabDocsContent.tsx` (4×, + duplicate file); `grep -rl "var(--" src/components src/app` → only `src/app/globals.css` itself. | Add `--brand-orange: #FF8225;` to the `:root` token block (if not already named) and replace literal hex with `var(--brand-orange)` across the 6 files; add an eslint rule or code-review checklist item banning raw hex in components. | M |
| A6 | P2 | Component size/complexity | `Hub.tsx` (634 lines) and `HomelabDocsContent.tsx` (458 lines, 491-line sibling data file) are large multi-responsibility components mixing routing/view-state, data-fetching (ping), scroll-spy, and markup — both also appear in the lint error list. | `wc -l src/components/*.tsx` → `Hub.tsx` 634, `HomelabDocsContent.tsx` 458; `00-baseline.md:14` lists both among "top offending files" for lint errors (3 and 4 issues respectively). | Split `Hub.tsx` by concern: extract ping/backend-latency polling into a hook, extract each `activeView` branch into its own component (ideally obsoleted entirely by A2's route consolidation). Split `HomelabDocsContent.tsx`'s scroll-spy/sidebar logic into a `useScrollSpy` hook. | L |
| A7 | P3 | Repo hygiene | Working-note files (`update-backlog.md`, `plan-oct-23.md`, `plan-sept-20.md`, `review-council-plan.md`) sit loose at repo root instead of under `docs/`, mixed in with real project config (`package.json`, `tsconfig.json`). | `ls` repo root → `plan-oct-23.md`, `plan-sept-20.md`, `review-council-plan.md`, `update-backlog.md` alongside `package.json`, `next.config.ts`, etc. | Move all planning/notes markdown into `docs/notes/` (or `docs/planning/`); keep repo root to config files + `README.md`/`AGENTS.md`. | S |
| A8 | P3 | README state | `README.md` is still the default `create-next-app` boilerplate (dev-server instructions, Vercel font blurb) with one project-specific "Postmortems" section bolted on; it doesn't mention `/updates`, the Hub SPA structure, or the `" 2"`-duplicate/lint issues a new contributor would hit immediately. | `README.md:1-20` — unedited `create-next-app` header/getting-started copy; only one custom section ("Postmortems") found past that. | Replace boilerplate with a short project-specific README: route map, `content/` conventions for both postmortems and updates, and a note on the `AGENTS.md` Next.js 16 caveat. | S |

## Proposed Target Folder Structure

Current structure is close to idiomatic App Router but blurred by the Hub-SPA/route duplication (A2) and missing `ui/` primitives layer (A4). Proposed target:

```
src/
  app/
    page.tsx                  # thin: renders <LandingPage/> only — no activeView switch
    about/page.tsx
    infrastructure/page.tsx
    documentation/page.tsx
    postmortems/[slug]/page.tsx
    updates/[slug]/page.tsx
    api/...                   # unchanged
  components/
    ui/                       # NEW — shared primitives
      Pill.tsx
      Pager.tsx
      ThemeToggle.tsx
      LanguageToggle.tsx
    layout/                   # NEW — page chrome
      PageHeader.tsx           # consolidates header markup repeated in *PageClient.tsx
    hub/                      # Hub-specific pieces, post A2 split
      Hub.tsx
      BackendLatency.tsx
    documentation/
      DocumentationPageClient.tsx
      HomelabDocsContent.tsx
      ScrollSpy.ts              # extracted hook
  lib/
    useLang.ts                 # NEW — consolidates A3 duplication
    strings.ts
    postmortems.ts
    updates.ts
  data/
    homelab.ts
docs/
  review/                      # this council's output (already correct)
  planning/                    # NEW home for plan-*.md, update-backlog.md, review-council-plan.md
```

Key moves: (1) delete the four `" 2"` duplicates (A1); (2) resolve the Hub-vs-routes duplication by making `app/page.tsx` a thin landing page (A2); (3) introduce `components/ui/` for `Pill`/`Pager`/toggles (A4); (4) introduce `lib/useLang.ts` to kill the 5x duplicated lang effect (A3); (5) relocate root-level planning markdown into `docs/planning/` (A7).
