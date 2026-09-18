---
title: Two-Tier Automated Container Updates with Watchtower
date: 2026-09-18
duration: ongoing
tags: [Homelab, Reliability]
---

## What shipped

Watchtower runs on both non-cluster hosts, but not every container gets the same treatment: stateless infra pieces auto-update on sight, while anything holding real user data or state — Sonarr, Radarr, Jellyfin, qBittorrent, Prowlarr, byparr, Seerr, Gluetun — is kept on monitor-only. A separate script reads Watchtower's own logs daily, and if any of those protected containers has a new image waiting, it fires a real alert into Alertmanager instead of updating silently or getting forgotten.

## Why

Blind auto-updates are a reasonable default for stateless services, but not for anything where an image bump could touch a database schema, break a library's config format, or interrupt something mid-download. The failure mode without this script is worse than either extreme: monitor-only with nobody actually checking is functionally "never updates," which quietly accumulates the exact CVE and bug-fix debt auto-updates exist to avoid.

## How it's set up

A `PROTECTED` allowlist in the review script mirrors Watchtower's own monitor-only labels in the media stack's `docker-compose.yml` — kept in sync by hand, called out in a comment so it doesn't silently drift. The script scans Watchtower's logs since 4am UTC for each protected image's "Found new image" line, and if anything matches, POSTs a synthetic alert straight to Alertmanager's API (`alertname: WatchtowerPendingReview`, `severity: info`) rather than needing its own separate notification path — it rides the same Discord/alerting pipeline every other homelab alert already uses. No matches, no alert, no noise.

## What's next

The allowlist is maintained by hand against the compose file rather than derived from it — if a new stateful container gets added to the monitor-only tier without also adding it here, it silently drops out of review instead of erroring. Worth generating one from the other at some point.
