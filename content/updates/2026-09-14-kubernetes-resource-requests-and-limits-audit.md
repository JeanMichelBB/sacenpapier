---
title: Kubernetes Resource Requests and Limits Audit
date: 2026-09-14
duration: one day
tags: [Kubernetes, Reliability]
---

## What shipped

Every container across all 13 Deployments in the cluster — 10 in `default`, 3 in `homelab-dashboard` — now has CPU/memory requests and limits set, sized from real `kubectl top pods` observations rather than guessed.

## Why

Spotted live: the hub's Deployment had `resources: {}` — completely empty. That turned out not to be one app's oversight; every single container in the cluster had the same gap. No requests means no scheduling guarantees and real noisy-neighbor risk, which matters more than usual here since two of the three nodes are resource-constrained OCI free-tier instances.

## How it's set up

Sizes came from actually observing idle usage, not defaults pulled from a guide:
- FastAPI/Next.js backends (Apercu, BotWhy, PopRoom, x, homelab-backend, the hub): observed ~1-5m CPU / 45-99Mi idle → `100m`/`128Mi` request, `500m`/`256Mi` limit.
- Static nginx frontends across all 5 apps: observed ~0-1m CPU / 2-6Mi idle → `20m`/`32Mi` request, `100m`/`64Mi` limit.
- `homelab-redis`: `20m`/`32Mi` request, `100m`/`128Mi` limit.
- The shared `mysql` instance — highest blast radius, serving 5 apps' databases from one pod, already at ~506Mi idle — got real headroom: `250m`/`512Mi` request, `1000m`/`1Gi` limit.

Checked actual node capacity before committing to any number: `elitedesk` (4 CPU/16GB) hosts nearly all backends plus MySQL; the two OCI free-tier nodes (2 CPU/~6GB each) host mostly frontend replicas. Summed requests came nowhere near either tier's capacity, confirmed after rollout by every pod landing `Running` with zero restarts and zero scheduling failures across all three nodes.

## What's next

Two things found along the way, left for later rather than patched blind: a nightly `mysql-backup` CronJob also has empty `resources: {}` but isn't declared in any app's git repo — it was applied manually outside GitOps, so it wasn't touched here pending a proper import into `shared-mysql`'s manifests. Separately, the audit surfaced 3 more orphaned `Completed` pods (95-123 days old, owned by ReplicaSets already scaled to zero) that Kubernetes garbage collection had failed to clean up — confirmed they weren't Job/CronJob pods, then removed with zero impact on the live replicas.
