---
title: NetworkPolicies Shipped Across the Fleet
date: 2026-09-14
duration: ~1 day, zero downtime
tags: [Kubernetes, NetworkPolicy, Security, k3s, Traefik, MySQL]
---

## What shipped

11 NetworkPolicies across 5 apps plus the default namespace: frontends locked down to Traefik-only ingress, and the shared MySQL instance locked to only its 4 real client apps.

## Why

Every pod in the cluster could previously reach every other pod by default — normal for a homelab cluster that grew organically, but not something that should stay true once the fleet is running production traffic for external users.

## How it's set up

Each policy was verified against live traffic paths before and after rollout, plus a negative test (confirming a non-whitelisted source genuinely gets blocked, not just that whitelisted sources still work). Mid-rollout, one policy briefly cut off Prometheus's own scrape traffic to a backend that shares its `/metrics` port with its regular API port — caught immediately from the live scrape-health signal and fixed in the same session, with no user-facing downtime at any point.

## What's next

None outstanding from this rollout — the near-miss on Prometheus scraping is a useful reminder to explicitly account for monitoring traffic, not just user traffic, on any future policy covering a port that's dual-purposed like that.
