---
title: Blackbox Exporter for All Public URLs
date: 2026-09-13
duration: one day
tags: [Prometheus, Observability, Homelab]
---

## What shipped

One `blackbox-exporter` instance on the monitoring Pi (`tspi`) now probes all six public URLs — sacenpapier.org, Apercu, BotWhy, PopRoom, x, and the homelab dashboard — instead of any one-off, per-app uptime check. A single Prometheus scrape job hits each site through the exporter's `/probe` endpoint, each tagged with a `project` label, backed by two new alert rules.

## Why

Cheap outside-in uptime checking is worth having across the whole fleet, and there was no reason to build it six separate times. It's deliberately paired with the same-day rollout of app-level business metrics — a probe only proves a site *responds*, not that it's doing the right thing, which is exactly the gap that let the September 11 dashboard incident go undetected.

## How it's set up

`prom/blackbox-exporter` added to the `homelab` repo's `tspi/monitoring/docker-compose.yml`, with module config reused from a genuine pre-existing WIP file found uncommitted on the box. The `blackbox-public-sites` scrape job probes all six URLs via the standard relabel pattern. Two alert rules: `SiteUnreachable` (per-site probe failure, 2 minute window) and `BlackboxExporterDown`, so a dead exporter doesn't silently blind all six checks at once. Both configs were validated with `promtool check config` before committing.

## What's next

Hit a real, generalizable deploy gotcha along the way: `tspi`'s Prometheus config is bind-mounted from a path that's a symlink into the `homelab` git checkout, but Docker resolves a bind mount to the file's specific inode at container-creation time. A `git pull` replaces the file with a new inode, so neither the new content on disk nor a `SIGHUP` reload reached the running container — `docker exec prometheus cat prometheus.yml` kept showing the stale config with zero blackbox mentions. Only `docker compose up -d --force-recreate prometheus` picked up the change. Worth remembering for any future edit to a bind-mounted config on that box: `git pull` + reload isn't enough, it needs `--force-recreate`.
