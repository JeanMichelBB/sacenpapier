---
title: Uptime Kuma's Single-Fire Alerts Hid a 37.5-Hour Outage
date: 2026-08-08
duration: 37.5h undetected
tags: [Uptime Kuma, Monitoring, Alerting]
---

## What happened

A service went down and stayed down for 37.5 hours before anyone noticed — despite Uptime Kuma monitoring it and, on paper, having already alerted. The outage looked like a monitoring blind spot at first: had Kuma actually seen it go down, or had the check itself failed silently?

## Root cause

Kuma had seen it — once. Every one of its 11 monitors was configured with `resend_interval=0`, meaning a monitor fires exactly one notification when a service transitions to down, then goes quiet until it comes back up, no matter how long that takes. The single alert at the start of this outage did fire and did get sent; it just arrived, got missed or dismissed, and nothing followed up for the next day and a half. One continuous 37.5-hour outage looked, from the alert history, identical to a single blip that resolved itself.

## Fix

Set `resend_interval=30` on all 11 monitors, so a down service nags roughly every 30 minutes for as long as it stays down instead of alerting once and going silent.

## Prevention

Single-fire alerting is a reasonable default for noisy, self-resolving flaps, but it's the wrong default for anything where a missed notification has real cost. Worth checking any other alerting surface in the stack (Prometheus Alertmanager included) for the same single-fire assumption before it hides another multi-hour gap.
