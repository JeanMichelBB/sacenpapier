---
title: False-Positive Memory-Leak Alert Had No Uptime Guard
date: 2026-09-09
duration: ~30min to diagnose
tags: [Prometheus, Alerting, Longhorn, instance-manager]
---

## What happened

The `LonghornInstanceManagerMemoryLeak` alert — added after July's real instance-manager memory leak — fired again. Given the history, this looked like a recurrence of the same leak until the underlying pod turned out to have restarted recently, with memory usage nowhere near leak territory.

## Root cause

The rule measured memory *delta* over a fixed window with no minimum-uptime guard. A freshly restarted pod's memory climbs from a near-zero baseline as it warms up, and that climb looks identical, delta-wise, to the early slope of a real leak. The rule couldn't distinguish "just restarted" from "leaking" because it was never told to check which one it was looking at.

## Fix

Added a 6-hour minimum container-uptime requirement before the delta rule is allowed to fire, so a pod restart can no longer fake a leak signature in the first few hours of its life.

## Prevention

Any alert built on a rate-of-change or delta measurement is vulnerable to this exact failure mode after a restart, not just this one rule. Worth auditing the other 28 rules in the set for the same missing guard rather than waiting for each one to false-positive individually.
