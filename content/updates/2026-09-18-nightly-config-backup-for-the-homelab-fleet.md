---
title: Nightly Config Backup for the Homelab Fleet
date: 2026-09-18
duration: ongoing, nightly
tags: [Homelab, Reliability]
---

## What shipped

Both `elitedesk` and `tspi` — the two hosts running things outside the k3s cluster itself — cron a nightly script that pulls their own live configuration back into the `homelab` git repo and pushes it: Docker Compose files, Prometheus/Alertmanager configs, every Grafana dashboard (exported fresh via the Grafana API, not hand-copied), and each host's own crontab.

## Why

Config that only exists on the box that runs it isn't really backed up — it's one disk failure away from having to be rebuilt from memory. Grafana dashboards in particular tend to drift from whatever's committed, since they're usually edited live in the UI, not in a text editor. This closes that gap without changing how anything is actually edited day to day.

## How it's set up

Each host's script does the same shape of work: `git pull --rebase` first, then copy the live config files over their tracked counterparts in the repo, commit, and push — a real, auditable diff every night if anything actually changed, a silent no-op if it didn't. Grafana dashboards are pulled through its own API (`/api/search` then `/api/dashboards/uid/...`) using a token on disk, so what lands in git is the dashboard as Grafana currently has it, not a stale export. Anything holding a real secret is redacted before it's copied — `elitedesk`'s media stack `.env` is stripped down to just its key names (`KEY=` with the value cut) before it's written to `.env.example`.

## What's next

This is a config backup, not a disaster-recovery story — it captures what's running, not a tested path to rebuilding a dead box from scratch. TrueNAS-side snapshot/replication with an actual periodic test restore is still open.
