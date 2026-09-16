---
title: Longhorn Snapshot Retention Was Never Working — a Recurring Job That Only Creates
date: 2026-09-08
duration: ongoing, low severity
tags: [Longhorn, Snapshots, Memory, MySQL, Monitoring, Known Upstream Bug]
---

## What happened

Revisiting the July 31st instance-manager memory leak turned up that its "structural fix" — a daily recurring job meant to keep the MySQL volume's snapshot chain capped at 7 — has never actually deleted a single snapshot. It ran successfully every night for 25 straight days, creating one snapshot each time and pruning zero, growing the chain from 0 to 25 and quietly reproducing the exact growth mechanism that froze Jellyfin in July, just ~60x slower (2.7 MiB/day now vs. ~170 MiB/day then).

## Root cause

Longhorn's recurring-job `task` field has multiple types that are not interchangeable: `snapshot` creates a new snapshot, while separate types (`snapshot-cleanup`, `snapshot-delete`) are meant to prune. The existing job (`default-snapshot-cleanup`, created July 31st) was configured with `task: snapshot` and `retain: 7` — but `retain` has no pruning effect for that task type; it only governs count-based retention on tasks specifically designed for it, and this isn't one of them. The job's name implied cleanup; its configuration only ever created.

Attempting to fix this by adding a proper `snapshot-cleanup` job revealed a second, deeper issue: that task type only purges snapshots Longhorn's engine considers **fully redundant** (every unique block already overwritten by a later snapshot) — not simply "old" or "beyond a count." A live MySQL volume with genuinely unique data per snapshot may never produce redundant snapshots on its own, so this task type is structurally unable to solve unbounded count growth for this kind of workload.

Attempting to fix it a third way — direct manual deletion — hit a confirmed, open upstream Longhorn bug ([longhorn/longhorn#10614](https://github.com/longhorn/longhorn/issues/10614)): deleting a Snapshot custom resource (via `kubectl delete`, the REST `snapshotDelete` action, or the REST `snapshotPurge` action) succeeds at the Kubernetes-object level but the underlying engine-level snapshot is never actually removed, so Longhorn's reconciliation loop resurrects an identical CRD moments later. This is reported against v1.8.1 and reproduced here on v1.11.0 — an upstream defect spanning at least three minor versions, not a local misconfiguration.

## Fix

No fix was applied to the underlying snapshot pileup — deleting it would require working around a confirmed upstream bug on a live production database volume, which carries more risk than the problem currently justifies. The one incidental improvement (`snapshotMaxCount` discovered at an effectively meaningless default of 250) was left unchanged for the same reason: Longhorn refuses to lower it below current usage, so it can't be tightened without first solving the deletion problem it's meant to backstop.

The ineffective `snapshot-cleanup` recurring job added during this investigation was removed rather than left as false reassurance.

## Prevention

The July postmortem's monitoring recommendation — instance-manager memory growth and snapshot-count alerting — was the thing that actually caught this, and remains the real safety net: `LonghornInstanceManagerHighMemory` and `LonghornInstanceManagerMemoryLeak` will fire with a wide margin before this reaches anything near the 7.53GiB that caused the July freeze, at the current slow growth rate. Snapshot-chain length reduction via Longhorn's own recurring-job tooling is not currently achievable for this workload without hitting the open upstream bug; revisit on a future Longhorn version upgrade rather than continuing to work around it now.
