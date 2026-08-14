---
title: BotWhy — Admin UI
date: 2026-07-05
duration: 2 days
tags: [BotWhy, Admin, Moderation]
---

## What shipped

A full admin panel: user list and detail views, role management with a self-demotion guard, soft-delete and reactivate for accounts, a credit adjustment endpoint with an audit trail, and a transaction ledger view — plus the admin frontend routes and pages to use all of it.

## Why

Running a public app with real payments and user accounts needs an operator surface — looking up a user, adjusting credits after a support issue, deactivating an account — that doesn't require direct database access for routine tasks.

## How it's set up

A `require_admin` dependency gates every admin endpoint; admin emails auto-promote on login rather than needing a manual role flag; the self-demotion guard specifically prevents an admin from accidentally removing their own access. Built on a dedicated `worktree-admin-ui` branch and merged as one unit once complete, with test coverage for the 403/404 paths.

## What's next

Trending post moderation and manual credit reconciliation tools were added to this same admin surface a few days later, once real usage started surfacing things worth moderating.
