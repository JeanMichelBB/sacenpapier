This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Postmortems

Postmortems are markdown files in `content/postmortems/`, loaded at request time by `src/lib/postmortems.ts` — no code changes needed to add one.

**Add a new postmortem:**

```bash
npm run new-postmortem -- "Incident Title"
```

This creates `content/postmortems/YYYY-MM-DD-incident-title.md` pre-filled with frontmatter and section stubs:

```markdown
---
title: Incident Title
date: 2026-08-12
duration:
tags: [ ]
---

## What happened

## Root cause

## Fix

## Prevention
```

Fill in `duration`, `tags` (comma-separated, e.g. `[k3s, Longhorn]`), and the section bodies — you can rename or add `##` sections freely, the detail page renders whatever's there. Save the file and it shows up on the site automatically:

- The homepage feed (`Hub.tsx` → `PostmortemCard`) lists every postmortem, using the first section as the preview summary.
- Each one gets its own page at `/postmortems/<slug>` with a "More postmortems" list of related posts, ranked by shared tags.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
