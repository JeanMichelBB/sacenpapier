---
title: BotWhy — Trending Moderation and Credit Reconciliation
date: 2026-07-09
duration: one day
tags: [BotWhy, Admin, Moderation]
---

## What shipped

Trending post reporting with author-only deletion, all trending posts surfaced in the admin moderation view, and a manual OpenRouter spend reconciliation tool in the admin panel.

## Why

Once real usage started, two gaps in the admin surface built days earlier became apparent: no way to flag or remove problematic trending content, and no way to manually reconcile BotWhy's recorded credit spend against what OpenRouter actually billed.

## How it's set up

The report button lives in the conversation's likes row, right-aligned alongside the delete control — deletion is restricted to the post's author or an admin. Credit reconciliation is a manual admin action, not automated, matching the small scale this needed to operate at.

## What's next

A schema mismatch in `TrendingConversationBase.reports` (not matching the actual stored shape) got caught and fixed the same day this shipped — the kind of bug that only surfaces once a feature is actually exercised with real data.
