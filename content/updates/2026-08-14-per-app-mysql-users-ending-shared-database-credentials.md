---
title: Per-App MySQL Users — Ending Shared Database Credentials
date: 2026-08-14
duration: ~30min
tags: [MySQL, Security, shared-mysql]
---

## What shipped

`PopRoom`, `BotWhy`, `Apercu`, and `x` each connect to the shared MySQL instance (`shared-mysql`), but all four were using the exact same login — one username and password with broad `ALL PRIVILEGES` grants across every app's database. Replaced that with four dedicated MySQL users, each scoped to only its own database: `apercu_app` → `apercu`, `botwhy_app` → `chatbox_db`, `x_app` → `twitter_db`, `poproom_app` → `poproom`. The old shared login's grants on all four databases were revoked once every app confirmed healthy on its new credentials.

## Why

Shared credentials meant no real isolation between apps at the database layer — a leaked secret, a SQL injection bug, or any compromise in one app's backend would have given full read/write access to every other app's data too, despite the databases themselves being properly separated by name. Scoped, per-app credentials close that gap: a breach in one app now stays contained to that app's own database.

## How it's set up

Each app's `k3s/secrets/*.yml` (gitignored, never pushed — same pattern as every other secret in this fleet) now carries its own dedicated `DB_USER`/`DB_PASSWORD` (or `MYSQL_USER`/`MYSQL_PASSWORD` for `x`), applied straight to the cluster via `kubectl apply`. No schema or data was touched — this was purely an authentication and authorization change, verified with real row-count checks and live health checks on every app before and after the cutover, plus one flagged and left-alone orphaned secret (`twitterclone-backend-secret`) that turned out to be unused by any live deployment.

## What's next

Secrets management (SOPS or Sealed Secrets) is still the natural next step — these credentials are safe from git exposure only because every repo's `.gitignore` excludes `k3s/secrets/`, which is a convention, not a guarantee. Encrypting them so they can be safely committed alongside the rest of each app's GitOps-managed manifests would close that gap for good.
