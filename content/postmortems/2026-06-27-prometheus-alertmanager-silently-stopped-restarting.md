---
title: Prometheus and Alertmanager Silently Stopped Restarting
date: 2026-06-27
duration: unknown — caught by a watchdog, not a report
tags: [Docker, Monitoring, Prometheus, Alertmanager, libnetwork, tspi]
---

## What happened

Prometheus and Alertmanager, both part of the monitoring stack on tspi, stopped coming back after a host reboot — not crash-looping, not erroring, just absent from `docker ps`. Nothing else in the same compose stack was affected, and there was no alert for it, since the thing that was supposed to alert was one of the two containers missing.

## Root cause

Not a crash loop and not a compose misconfiguration — a Docker daemon / libnetwork race on a shared bridge endpoint at boot. When multiple containers on the same user-defined bridge network start attempting to attach around the same time as dockerd itself is coming up, a subset can silently fall out of the restart queue instead of erroring loudly. Prometheus and Alertmanager happened to be the two that lost the race this time; which containers it hits isn't deterministic.

## Fix

Added a `docker-watchdog.sh` cron job on tspi, running every 5 minutes, health-checking all 6 monitoring containers (Loki included) and restarting any that aren't running. This doesn't fix the underlying libnetwork race — that's a Docker-level issue outside this stack's control — but it caps the blast radius at 5 minutes instead of "until someone notices Grafana has no data."

## Prevention

The watchdog is the safety net rather than a real fix, since the root cause lives in Docker itself. Worth revisiting if this recurs on a Docker daemon upgrade that addresses the race directly; until then, the 5-minute cron is the backstop.
