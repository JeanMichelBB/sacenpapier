---
title: Longhorn Webhook Watchdog
date: 2026-09-18
duration: ongoing
tags: [Kubernetes, Longhorn, Reliability]
---

## What shipped

A cron job on `elitedesk`, running every 5 minutes, that watches for a specific recurring failure signature in Longhorn's manager logs — `webhook ... context deadline exceeded` — and, once it's seen more than 3 times in a 5-minute window, deletes Longhorn's own stale validating and mutating webhook configurations so it re-registers itself cleanly.

## Why

Longhorn's admission webhooks occasionally get stuck in a state where the registered webhook endpoints stop responding within their deadline, and the failure doesn't self-heal — it just keeps timing out until something forces re-registration. Left alone, that quietly blocks anything that needs Longhorn's admission webhooks to validate, which is a worse failure mode than a clean, loud error.

## How it's set up

The script checks Longhorn's manager pods are actually ready first (skip silently if not — nothing to fix yet), then greps the last 5 minutes of manager logs for the specific timeout signature rather than reacting to any error. Past a 3-occurrence threshold, it deletes the `longhorn-webhook-validator`/`longhorn-webhook-mutator` configs with `--ignore-not-found`, which Longhorn re-creates within about 2 minutes on its own — the fix is forcing a clean re-registration, not anything more invasive than that.

## What's next

This treats a known symptom, not the underlying cause inside Longhorn's webhook registration logic — it's a backstop that caps the blast radius rather than a real fix, the same shape as the separate `docker-watchdog.sh` mitigation for tspi's monitoring stack.
