---
title: Jellyfin Freeze — Longhorn Instance-Manager Memory Leak
date: 2026-07-31
duration: 42 days to surface; recurred 55 days later
tags: [Longhorn, Memory Leak, Jellyfin, Monitoring, Known Upstream Bug]
---

## What happened

Jellyfin streams froze because longhorn-instance-manager leaked ~170MB/day for 42 days, traced to a 430-snapshot pileup left over from the [June 19th incident](/postmortems/2026-06-19-k3s-longhorn-disk-incident) with no recurring job to prune them. Fixed by pruning the chain, tuning replica timeouts, and adding monitoring.

## Root cause

longhorn-instance-manager on elitedesk grew from near-zero to 7.53GiB over 42 days — a clean linear ~170MB/day trend confirmed via Prometheus, specific to the node hosting the volume's engine (not its replicas, which stayed flat at ~100-160MiB). The engine owns the full snapshot chain and runs periodic background maintenance that walks it on every pass. That chain had 430 snapshots on pvc-6b54074e (the same MySQL PVC from the June incidents) — 409 of them created within 24 hours during the [June 19th disk-pressure/webhook-deadlock event](/postmortems/2026-06-19-k3s-longhorn-disk-incident), when repeated failed replica rebuilds each left behind a temporary sync snapshot that no recurring job existed to prune. A separately tight 8-second engine-replica-timeout, too short for two of three replicas reached over Tailscale WAN, then triggered an ordinary latency spike to look like a dead replica on July 29th — forcing a full rebuild that spiked the already-leaking instance-manager past the threshold and froze Jellyfin's streams.

## Fix

Pruned the 430-snapshot chain down to a healthy count, which let the instance-manager release its accumulated memory. Increased engine-replica-timeout so ordinary WAN latency to the OCI replicas no longer triggers unnecessary full rebuilds.

## Prevention

Added monitoring on instance-manager memory growth and snapshot counts per volume so a similar pileup gets caught in days, not 42. This closes the loop on a failure chain that started with the [June 19th incident](/postmortems/2026-06-19-k3s-longhorn-disk-incident) — a Longhorn recurring job to auto-prune rebuild snapshots is the structural fix still worth adding.

## Update (2026-09-24): the leak came back — this time a real Longhorn bug

The instance-manager memory alert fired again on the same pod, now hosting the MySQL volume under a new PVC after it was recreated. Memory had reached 2.48GiB. This time the recurring-job/timeout mitigations above were confirmed innocent: `engine-replica-timeout` was still doing its job, and the snapshot count sat at a normal 20 — not another 430-snapshot pileup. (That recurring job's own "retain: 7" turned out to be a no-op the whole time regardless — see the [September 8th postmortem](/postmortems/2026-09-08-longhorn-snapshot-retention-was-never-working-a-recurring-job-that-only-creates) for that separate, still-open problem. It wasn't the cause of this spike.)

With no pileup to blame, the actual cause turned out to be upstream: Longhorn v1.11.0 ships a confirmed gRPC proxy-connection-leak regression in `longhorn-instance-manager` — new Proxy service APIs introduced that version that don't close connections properly ([longhorn/longhorn#12643](https://github.com/longhorn/longhorn/issues/12643), [#12668](https://github.com/longhorn/longhorn/issues/12668), [#12573](https://github.com/longhorn/longhorn/issues/12573)). Left running, it OOMs the node in about a week. Fixed upstream in v1.11.1.

Upgraded the cluster from v1.11.0 to v1.11.1: applied the new manifest, then discovered replicas migrate to new instance-managers automatically but the **engine** — and specifically the instance-manager process actually serving it, which is where the leaky proxy code lives — does not. Patching the volume's `spec.image` marks the engine "upgraded" without moving it off the old, still-buggy instance-manager pod; Longhorn's own DaemonSet rollout also skips replacing an instance-manager that's actively serving an attached engine, to avoid an I/O interruption. The fix that actually works is the blunt one: delete the old instance-manager pod outright, forcing the engine to re-home onto the instance-manager already running the new version. Verified all three cluster nodes on `v1.11.1` afterward, volume healthy throughout, ~40 seconds of degraded status during the swap, no data loss.
