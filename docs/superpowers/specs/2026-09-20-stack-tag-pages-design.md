# Stack Tag Pages — Design

Date: 2026-09-20

## Problem

The site's content is siloed by type: Projects (homepage cards), Updates (a feed, filterable
by a curated `skills.ts` taxonomy), and Postmortems (a feed, no filtering at all). There's no
way to ask "show me everything about React" and get a single answer — clicking a skill only
filters the Updates feed in place, and doesn't touch Projects or Postmortems at all.

Separately, the curated `skills.ts` taxonomy groups several raw tags under one label (e.g.
"GitOps" = `ArgoCD` + `FluxCD` + `Kustomize` + `GitOps`; "Kubernetes" = `k3s` + `Kubernetes`),
which adds hand-maintenance burden and doesn't match 1:1 with the tags actually shown on
project/update/postmortem cards.

## Goal

Clicking any tag, anywhere on the site, takes you to one canonical page for that tag —
`/stack/<tag>` — showing every Project, Update, and Postmortem that carries it. Retire the
in-place, curated-taxonomy filtering on the homepage Updates feed in favor of this.

## Non-goals

- No changes to content authoring (frontmatter format, `sacenpapier-content` skill) — tags are
  already collected today, this only changes how they're consumed.
- No redesign of the Projects/Updates/Postmortems card components beyond making their tag chips
  clickable.
- Not merging Updates and Postmortems into one feed type — they stay separate content types,
  just both indexable by tag.

## Data model

No new data. Tags already exist:
- `Project.tags: string[]` — hardcoded in `src/data/projects.ts`.
- `Post.tags: string[]` — parsed from frontmatter by `src/lib/posts.ts`, shared by both
  `getAllUpdates()` and `getAllPostmortems()`.

A stack page is a filtered view over these three existing sources — no schema changes.

## Routing

New dynamic route: `src/app/stack/[tag]/page.tsx`.

- `[tag]` is a URL-safe slug (e.g. `ci-cd` for the literal tag `"CI/CD"`).
- `generateStaticParams` walks every tag across `projects`, `getAllUpdates()`, and
  `getAllPostmortems()`, slugifies each, and statically generates one page per distinct tag —
  same static-generation pattern already used for `/updates/[slug]` and `/postmortems/[slug]`.
- An unknown slug calls `notFound()` (standard Next.js 404).

## Slug mapping

New `src/lib/tagSlug.ts`. Slugifying a tag (lowercase, non-alphanumeric → `-`) is easy, but
inverting that back to the exact original tag string (`"CI/CD"`, not `"ci-cd"`) isn't safely
reversible by regex alone. Instead, build a `Map<slug, originalTag>` once by scanning all three
data sources at request/build time, and look up the incoming slug in that map. This also gives
a natural place to detect slug collisions (two different tags slugifying to the same string) —
none exist today, but the map makes it detectable rather than silently wrong.

## Page content

Title = the original tag string (e.g. "React"). A "← Back home" link, matching the About and
Infrastructure pages' existing style. Then, in order, only rendering sections that have at
least one match:

1. **Projects** — `ProjectCard`, filtered to `project.tags.includes(tag)`.
2. **Updates** — `PostCard` list (same as the homepage Updates feed), filtered to
   `update.tags.includes(tag)`.
3. **Postmortems** — `PostCard` list (same as the homepage Postmortems feed), filtered to
   `postmortem.tags.includes(tag)`. This is new — postmortems have no tag-filtered view today.

No pagination on stack pages initially — tag-filtered lists are expected to be short (YAGNI;
add pagination later if a tag's list actually grows long enough to need it).

## Changes to existing components

**Tag chips become links**, everywhere they currently render as plain `<span>`:
- `ProjectCard.tsx`
- `ProjectPreview.tsx`
- `PostCard.tsx` (shared by Updates and Postmortems)

Each becomes `<Link href={\`/stack/${slugify(tag)}\`}>`, keeping existing visual styling
(including the frontend/backend/infra color dots added earlier on `ProjectCard`/`ProjectPreview`
tags).

**Homepage Updates section (`Hub.tsx`) — simplified.** Remove:
- `selectedSkill` state and the `sk` URL query param
- `filteredUpdates` derivation
- The skill-chip filter row (including the "All" button)
- The `t.noSkillMatches` empty state

The Updates section reverts to a plain chronological, paginated list — matching how the
Postmortems section already behaves. Topic-based browsing now lives entirely on `/stack` pages
instead of being duplicated in place on the homepage.

**`skills.ts` — repurposed, not deleted.** It's no longer used for homepage Updates filtering,
but stays as the curated tech list for the About page's "What I work with" pills — a short,
hand-picked list is still worth keeping there (vs. showing every raw tag including non-tech
ones like "Demo" or "Homelab"). Each pill links to `/stack/<slug of skill.match[0]>` — the
skill's first/primary underlying tag — replacing today's `/updates?skill=` link target, which
no longer exists once the in-place filter is removed.

**i18n cleanup (`strings.ts`):** remove now-unused `allSkills` and `noSkillMatches` (en + fr).
`aboutStackTitle` is unaffected and stays. New minimal chrome on the stack page (back-home link,
section headers) reuses existing strings (`t.backHome`, `t.projects`, `t.updates`,
`t.postmortems`) — no new translation keys needed for the page itself.

## Error handling

- Unknown tag slug → `notFound()` → Next.js's standard 404 page (same as an unknown
  `/updates/[slug]` or `/postmortems/[slug]` today).
- A tag with zero matches in a given content type simply omits that section — not an error
  state, just an empty one (can't actually happen for a tag that reached the page at all, since
  `generateStaticParams` only generates pages for tags that have at least one match somewhere,
  but the per-section conditional guards it defensively anyway).

## Testing / verification

- Visual check in the browser pane for a tag that hits all three content types (e.g. `React` —
  appears on multiple projects and updates) and one that only hits one (e.g. a tag unique to a
  single postmortem).
- Confirm `/stack/ci-cd` (a punctuation-bearing tag) round-trips correctly through the slug map.
- Confirm an invalid slug 404s.
- Click through each of the three chip-link locations (project card, update card, postmortem
  card) to confirm they land on the correct `/stack/<tag>` page.
- Confirm the homepage Updates section still paginates correctly with the filter UI removed.
- Confirm About page's "What I work with" pills link correctly post-change.
- Both languages (en/fr) spot-checked for the (minimal) new/changed UI text.
