---
title: Shared Observability Pattern Across the Fleet
date: 2026-09-13
duration: one day
tags: [Prometheus, Observability, Kubernetes, FastAPI]
---

## What shipped

The same observability shape rolled out to all five FastAPI backends — homelab-sacenpapier, PopRoom, BotWhy, Apercu, and x: a `/metrics` endpoint via `prometheus-fastapi-instrumentator`, an `/api/health` check, and one app-specific business gauge per app that a pure infra-level check can't see. Each app gets its own NodePort metrics Service and a Prometheus scrape job on `tspi`, tagged with a `project` label.

## Why

Six apps had grown six bespoke (or nonexistent) ways of reporting health. The gap that mattered most: infra-level checks (pod up, container healthy) can't catch an app-correctness bug where the process is running fine but doing the wrong thing — which is exactly what caused the September 11 "0/6 devices" incident on the homelab dashboard. A business-level gauge per app closes that blind spot.

## How it's set up

Piloted on `homelab-backend`: `homelab_device_online{device=...}`, set from the same `_fetch_all()` results `/api/nodes` already computes. The pilot caught a real bug in itself — the gauge only updated on cold-start and background-refresh paths, so the common case (serving fresh cached data straight from Redis) left `/metrics` showing the gauge's `HELP`/`TYPE` lines with zero actual series. Fixed by updating the gauge on that path too.

Rolled out from there, one gauge per app chosen to match what could silently break:
- **PopRoom** — `poproom_active_players` / `poproom_active_connections`, via `Gauge.set_function()` reading the live in-memory dicts directly, deliberately avoiding the manual-update trap the pilot just hit. Also added `/api/health`, which didn't exist before.
- **BotWhy** — `botwhy_credit_transactions_last_hour{type=...}` via a custom `Collector` (three labeled values from one grouped query). If `purchase` rows silently drop to zero while the app stays healthy, that's an undetected broken Stripe webhook.
- **Apercu** — `apercu_pending_moderation_items{type=...}`, counting pending events/speakers/blog posts — the gauge most directly aimed at a workflow silently breaking with zero infra symptom. Its own JWT auth middleware had a path whitelist that needed `/metrics` and `/api/health` added, or Prometheus's scrapes 403'd.
- **x** — `x_tweets_created_last_hour`, counting recent posts as a "posting silently broke" signal. Same whitelist gotcha as Apercu, this time on its Bearer-token middleware.

Each metrics endpoint is exposed on its own NodePort rather than the public ingress, reachable only from inside the tailnet. Every app was verified live — `kubectl exec` into the running pod to hit `/metrics` and `/api/health` directly, then confirmed each Prometheus target showed `up` with the right `project` label.

## What's next

`x`'s rollout hit two rolling-update artifacts worth remembering, not bugs: a NodePort that hadn't synced until an ArgoCD refresh, and a `401` from `/metrics` that was just the request landing on the old pod during the brief overlap window before it terminated.
