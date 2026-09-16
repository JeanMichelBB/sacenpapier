---
title: SSH Hardening Review and Memory-Alert Tuning
date: 2026-07-09
duration: ~1 day
tags: [Security, SSH, Monitoring, Homelab]
---

## What shipped

A security pass across the homelab boxes' SSH configuration, plus a tuning fix on a false-alarm memory alert triggered by Watchtower's nightly auto-updates squeezing `glances`' memory limit.

## Why

Routine hardening — reviewing SSH exposure on every physical and remote node is cheap insurance, and it surfaced the `glances` alert as a side effect worth fixing rather than living with.

## How it's set up

SSH access across the fleet was reviewed node by node. The `glances` alert was confirmed harmless (Watchtower's own restart cycle was the trigger, not a real leak) and tuned so it stops firing on that expected, benign memory bump.

## What's next

No open items from this pass — folded into the broader ongoing security-hardening backlog item.
