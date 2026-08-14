---
title: ArgoCD Rollout — Shared MySQL Naming Collision
date: 2026-08-14
duration: ~3h (detection to full recovery)
tags: [ArgoCD, GitOps, MySQL, Data Loss, Recovery]
---

## What happened

Rolling out ArgoCD across six apps, two repos (`Apercu`, `x`) turned out to declare an identically-named shared MySQL resource. Pointing separate ArgoCD Applications at that collision caused the shared database volume to be recreated from scratch, silently wiping live data for three apps — one of them (BotWhy) kept running normally the whole time, never throwing an error.

## Root cause

Three separate app repos (`BotWhy`, `Apercu`, `x`) had — for months — each carried their own copy of an identical `k3s/mysql.yaml`, all declaring a Deployment/PVC/Service literally named `mysql`. This was harmless under the previous manual deploy model: running `kubectl apply` from any one repo just re-applied the same object, a no-op. ArgoCD doesn't work that way. It continuously reconciles resources and tracks ownership per `Application` via an annotation (`argocd.argoproj.io/tracking-id`). When `apercu`'s and `x`'s Applications were both created — each pointing at a different git repo, each declaring a resource with the same name — both tried to claim ownership of the same live objects. With `automated` sync and `prune: true` active on both, that ownership conflict is what triggered the PVC being torn down and recreated: a fresh MySQL initialization only auto-creates the one database named in its `MYSQL_DATABASE` env var, silently orphaning every other database that had been living in that instance's data directory.

The failure was compounded by an inconsistency between local secret files and what was actually deployed — Apercu's local `k3s/secrets/mysql-secret.yml` said the database was named `db_law`, but the live secret (and the app's actual connection string) used `apercu`. Backend error messages (`Access denied for user 'user'@'%' to database 'apercu'`) pointed at a permissions problem, but the real cause was the database no longer existing at all — MySQL's 1044 error code covers both cases, so a first read of the logs was misleading. `BotWhy` was the worst case: its backend never errored, because a valid — just empty — `chatbox_db` had been recreated. Nothing looked broken until row counts were checked directly.

## Fix

Immediately disabled automated sync on `apercu`, `x`, and (once the same risk was confirmed) `botwhy`, to stop any further reconciliation while investigating. Found that a `mysql-backup` CronJob had been quietly running full `mysqldump` backups of the shared instance daily to a TrueNAS NFS share — the most recent, from earlier that same morning, still had all five databases intact. Extracted each missing database's section from the compressed dump (`apercu`, `twitter_db`, `chatbox_db`, `poproom`), reconstructed the `SET FOREIGN_KEY_CHECKS` wrapper the naive line-range extraction dropped, imported each into the live instance, and re-granted the application's MySQL user access. Verified recovery with real row counts, not just "does it connect" — this is what caught `BotWhy`'s silent data loss, which an HTTP-status check alone had missed entirely.

With data restored, fixed the actual architecture: moved the shared MySQL instance into its own dedicated repo (`shared-mysql`), with its own ArgoCD `Application` as sole owner. `Apercu`, `x`, and `BotWhy` no longer declare any MySQL resources in their own repos at all — they just connect to `mysql:3306` as an external dependency, same as before, but the resource now has exactly one git source of truth. Re-enabled automated sync across all seven apps once the collision was structurally impossible to repeat, not just patched around.

## Prevention

The underlying lesson: a resource-naming pattern that's safe under imperative deploys (`kubectl apply`, idempotent no-ops on collision) is not automatically safe under GitOps, where every Application actively reconciles and prunes. Any resource shared across more than one app repo needs to live in its own repo with its own Application — never duplicated across the apps that use it, however harmless that duplication looked under the old deploy model.

Also worth carrying forward: verifying a recovery means checking real data (row counts, actual content), not connectivity or HTTP status alone. `BotWhy` looked completely healthy — every endpoint responding, no errors in logs — while quietly serving from a database with 1/6th its real user base. That gap almost went unnoticed.
