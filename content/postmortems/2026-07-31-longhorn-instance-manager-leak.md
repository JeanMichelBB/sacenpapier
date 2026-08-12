---
title: Jellyfin Freeze — Longhorn Instance-Manager Memory Leak
date: 2026-07-31
duration: 42 days to surface
tags: [Longhorn, Memory Leak, Jellyfin, Monitoring]
---

## What happened

Jellyfin streams froze because longhorn-instance-manager leaked ~170MB/day for 42 days, traced to a 430-snapshot pileup left over from the June 19th incident with no recurring job to prune them. Fixed by pruning the chain, tuning replica timeouts, and adding monitoring.

## Root cause

longhorn-instance-manager on elitedesk grew from near-zero to 7.53GiB over 42 days — a clean linear ~170MB/day trend confirmed via Prometheus, specific to the node hosting the volume's engine (not its replicas, which stayed flat at ~100-160MiB). The engine owns the full snapshot chain and runs periodic background maintenance that walks it on every pass. That chain had 430 snapshots on pvc-6b54074e (the same MySQL PVC from the June incidents) — 409 of them created within 24 hours during the June 19th disk-pressure/webhook-deadlock event, when repeated failed replica rebuilds each left behind a temporary sync snapshot that no recurring job existed to prune. A separately tight 8-second engine-replica-timeout, too short for two of three replicas reached over Tailscale WAN, then triggered an ordinary latency spike to look like a dead replica on July 29th — forcing a full rebuild that spiked the already-leaking instance-manager past the threshold and froze Jellyfin's streams.

## Fix

Pruned the 430-snapshot chain down to a healthy count, which let the instance-manager release its accumulated memory. Increased engine-replica-timeout so ordinary WAN latency to the OCI replicas no longer triggers unnecessary full rebuilds.

## Prevention

Added monitoring on instance-manager memory growth and snapshot counts per volume so a similar pileup gets caught in days, not 42. This closes the loop on a failure chain that started with the June 19th incident — a Longhorn recurring job to auto-prune rebuild snapshots is the structural fix still worth adding.
