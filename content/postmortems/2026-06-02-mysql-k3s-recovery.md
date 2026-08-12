---
title: MySQL + k3s Recovery — Longhorn Uninstaller Data Loss
date: 2026-06-02
duration: ~90min
tags: [MySQL, Longhorn, Data Loss, Recovery]
---

## What happened

Restoring a missing Longhorn CSI driver cascaded into a wrong-version install, missing CRDs, and the Longhorn uninstaller deleting the live MySQL volume. Recovered by migrating MySQL to local-path storage and manually rebuilding schemas — with data loss.

## Root cause

After the same-day k3s outage, the Longhorn namespace had been deleted as part of cleanup, removing the Longhorn CSI plugin DaemonSet. MySQL's PVC used storageClass: longhorn, so with driver.longhorn.io no longer registered with kubelet, the pod could not mount its volume and sat in Error state for 10 days before this was investigated. Attempting to reinstall Longhorn made it worse: v1.6.0 went in first (wrong version, crashed immediately with an engine controller API version mismatch), and once the correct v1.11.0 was installed, several CRDs (engineimages, nodes, replicas, snapshots) were missing. While the namespace was being cleaned up, the MySQL PVC entered Terminating and Longhorn's uninstaller processed the queued deletion — wiping the volume's data from disk.

## Fix

Force-cleared stuck finalizers on the Terminating Longhorn namespace, removed the wrong Longhorn version and installed v1.11.0, re-applied the manifest to create the missing CRDs, and confirmed longhorn-manager was 2/2 Running on all nodes. Since the MySQL volume data was already gone, migrated MySQL to the local-path storageClass instead, brought up a fresh pod, manually recreated every missing database and granted user access, then rebuilt tables via kubectl exec into each dependent app pod. A k3s API server crash mid-recovery required a restart, and stale SQLAlchemy connection pools needed pod restarts before apps came up cleanly.

## Prevention

Moved MySQL off Longhorn entirely (local-path storageClass) so a future Longhorn failure can't take the database down with it. This incident is also the direct origin of the two Longhorn-related incidents that followed later in June and July — the same PVC and the same webhook-registration failure mode kept resurfacing.
