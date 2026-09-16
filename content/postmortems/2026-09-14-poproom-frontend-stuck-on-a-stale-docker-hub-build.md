---
title: poproom-fe Stuck on a Stale Docker Hub Build
date: 2026-09-14
duration: several builds' worth, caught during Kustomize migration work
tags: [ArgoCD, Image Updater, Docker Hub, CI/CD, PopRoom]
---

## What happened

`poproom-fe` had been deploying the same stale image for several builds in a row — new commits went in, CI ran, but the running frontend never actually changed.

## Root cause

A chain of three separate issues, each one masking the last:

1. **Unscoped path filter.** `deploy.yml` had no path filter restricting the frontend build to frontend changes, so a backend-only commit still triggered a full frontend rebuild — producing a byte-identical image under a new tag.
2. **Identical build timestamps.** Because the frontend source hadn't actually changed, the rebuilt image carried the same effective build timestamp as the previous one.
3. **Image Updater's tiebreak.** ArgoCD Image Updater's `newest-build` strategy picks the image with the latest build time; with timestamps tied, it fell back to a string comparison of the tags themselves. A stale tag that happened to start with `f` — the maximum hex digit — permanently won that string tiebreak against every subsequent tag, no matter how new.

## Fix

Scoped the frontend build's path filter so unrelated backend commits stop producing duplicate frontend images, switched tags to monotonic zero-padded build numbers so ties can't happen on identical timestamps, and switched Image Updater's strategy from `newest-build` to `alphabetical`, which sorts correctly against the new monotonic tag format.

## Prevention

A build system's tag format and its update strategy's comparison logic have to agree with each other — `newest-build` silently degrading to a lexical string comparison on a tie is exactly the kind of interaction that only shows up after enough builds pile up to actually produce a tie. Monotonic, zero-padded, purely-numeric tags remove the ambiguity a string comparison could ever exploit again.
