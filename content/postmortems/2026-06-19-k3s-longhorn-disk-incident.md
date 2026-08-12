---
title: k3s Outage — Disk Pressure + Webhook Deadlock (Recurrence)
date: 2026-06-19
duration: 10min
tags: [k3s, Longhorn, Disk Pressure, Alerting]
---

## What happened

Same Longhorn webhook deadlock as June 2nd, this time triggered by disk at 94-95% full stalling SQLite writes. Cluster self-recovered in ~30 minutes; root disk-pressure alert had been firing unnoticed since 70%.

## Root cause

elitedesk's disk (/dev/nvme0n1p2) was at 94-95% full — the K3sSQLiteDiskHigh Prometheus alert fires at 70% but had gone unactioned. At that fill level SQLite write operations stall, which caused k3s to restart. On restart, the exact same Longhorn admission webhook deadlock from the June 2nd incident recurred: longhorn-manager pods weren't ready yet, so every volume operation against the same PVC (pvc-6b54074e, backing MySQL) hit a context deadline exceeded, blocking CSI staging and making the volume unmountable for the outage window.

## Fix

The cluster self-recovered once the Longhorn webhook configurations finished applying (~30 minutes after the restart). Disk pressure was resolved manually later the same day via a Docker cleanup that freed roughly 400GB of unused images and layers, dropping usage from 95% to 29%.

## Prevention

This incident is the direct evidence that the June 2nd fix (webhook deletion + DB compact cron) addressed the symptoms but not the underlying fragility — Longhorn's admission webhooks still deadlock on every k3s restart while its manager pods come up. The disk-pressure alert threshold and response process also needed to actually be acted on, not just fired.
