---
name: sacenpapier-content
description: Add a new Postmortem (incident writeup) or Update (shipped-feature writeup) to sacenpapier.org. Use this whenever the user wants to write up an outage, bug, incident, or root-cause analysis for the Postmortems section, or wants to document a feature/change they just shipped for the Updates section — even if they just describe what happened/what they built without saying "postmortem" or "update" by name. Also use it when they ask how to add content to either section, or want an existing draft file in content/postmortems or content/updates filled in and published.
---

# Adding a Postmortem or Update to sacenpapier.org

Both sections work the same way: a markdown file with frontmatter in `content/postmortems/` or `content/updates/`, picked up automatically at build time by `src/lib/postmortems.ts` / `src/lib/updates.ts` — no other code changes needed. The only real decision is which of the two the content belongs in, and getting the write-up itself right.

## 1. Pick postmortem vs. update

- **Postmortem**: something broke or misbehaved — an outage, a bug, a misconfiguration, data loss, a security issue. The reader wants to know what happened, why, and what changed so it doesn't happen again.
- **Update**: something shipped — a feature, a migration, a new piece of infrastructure. The reader wants to know what's new and how it works.

If the user's description doesn't make this obvious, ask — but usually the framing ("X went down", "I had to fix Y" vs. "I built Y", "I added Z") makes it clear on its own.

## 2. Scaffold the file

Check `content/postmortems/` or `content/updates/` first — the user may already have a draft sitting there untracked (`git status` will show it). If so, work with that file directly instead of scaffolding a new one.

Otherwise:

```bash
npm run new-postmortem -- "Incident Title"
# or
npm run new-update -- "Feature Title"
```

This creates `content/{postmortems,updates}/YYYY-MM-DD-slugified-title.md` with frontmatter (`title`, `date`, `duration`, `tags: [ ]`) and the right section headers already in place:

- Postmortem: `What happened` / `Root cause` / `Fix` / `Prevention`
- Update: `What shipped` / `Why` / `How it's set up` / `What's next`

## 3. Write the content

Read a couple of existing files in the same directory first (`content/postmortems/*.md` or `content/updates/*.md`) to match the site's voice — direct, specific, technical. Existing postmortems name exact root causes (not "a configuration issue" but which config, which line, which command), and existing updates describe the actual mechanism, not just the outcome. Don't pad sections that don't need padding; a short accurate write-up beats a long vague one.

Fill in the frontmatter:
- `duration`: only postmortems really need this (e.g. `~4h intermittent`, `30 min`) — leave it off or brief for updates.
- `tags`: 3-6 lowercase tags matching the style of existing entries (project names, technologies, affected systems) — grep other files in the same directory for tag conventions before inventing new ones.

Pull the actual details from the user's description, git history, or logs rather than guessing — if something is unclear (exact timeline, root cause, which fix actually worked), ask rather than filling in a plausible-sounding placeholder.

## 4. For an Update: does it need a new skill button?

`/updates` has a recruiter-facing skill filter (`src/data/skills.ts`) — clickable buttons like "Kubernetes" or "Security" that filter the list down to updates demonstrating that skill. It's deliberately narrower than the raw tag list: several related tags fold into one button (`ArgoCD`/`FluxCD`/`Kustomize` all match "GitOps"), and project-name tags (`x`, `BotWhy`, `PopRoom`, `Apercu`, `Homelab`) aren't skills, so they're left out entirely.

After tagging the new update, check its tags against `src/data/skills.ts`:

- **Already covered** — one of the new tags is already in an existing skill's `match` list (exactly or as an obvious synonym, e.g. a tag of `k8s` against the `Kubernetes` entry's `match: ["k3s", "Kubernetes"]`). Nothing to do.
- **A new tag for an existing skill** — the update introduces a tag that's clearly the same underlying skill as an existing button under a different name (e.g. a `Postgres` tag when there's a `MySQL` button — arguably still "databases", judgment call) or a closely related tool (a new IaC tool alongside GitOps). Add the tag to that skill's `match` array rather than creating a near-duplicate button.
- **A genuinely new, recruiter-relevant skill** — the update demonstrates a real, independently searchable technology or capability not covered by any existing button (e.g. the first update ever tagged `GraphQL`, or `Terraform`). Add a new entry to `skills.ts`. Keep the label as the plain, recognizable technology/skill name (not the raw tag if the raw tag is jargon-y), and set `match` to every tag variant that should trigger it.
- **Too one-off to be a button** — a tag that's specific to this one update and unlikely to recur or matter to a skill-scanning recruiter (e.g. a tag like `Rebrand` or `Demo`). Leave it as a plain tag on the post; don't add a button for it. The point of the filter is signal, not a button per tag — a wall of one-result buttons defeats the purpose.

This is a judgment call each time, not a mechanical sync — the goal is that `skills.ts` stays a short, high-signal list of real skills, not a mirror of every tag ever used.

## 5. Ship it

This repo pushes straight to `main`, which triggers GitHub Actions (build → Trivy scan → push to Docker Hub) → ArgoCD Image Updater (writes back a tag-bump commit to `main`) → the cluster rolls new pods automatically. There's no staging step — commit, push, and it deploys.

```bash
git fetch origin main -q && git status   # check for anything else pending first
git add content/{postmortems,updates}/<file>.md src/data/skills.ts   # include skills.ts only if you touched it
git commit -m "<type>: <short summary>

<why this is going up, 1-2 sentences>

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
git rebase origin/main && git push origin main
```

Then watch it land, the same pattern used throughout this repo's history:

```bash
gh run list --repo JeanMichelBB/sacenpapier --limit 1 --json databaseId,status,conclusion
# wait for status=completed, conclusion=success
```

Wait for ArgoCD's write-back commit to appear on `origin/main`, then confirm the pods rolled:

```bash
ssh tselitedesk "sudo k3s kubectl get pods -n default -o wide | grep hub"
```

Fresh pod ages (well under the time since push) confirm the rollout landed. Finish by loading the live page (`https://sacenpapier.org/postmortems/<slug>` or `/updates/<slug>`, and the paginated list on the homepage's Backend tab or Full-stack teaser) to confirm the new entry actually renders.
