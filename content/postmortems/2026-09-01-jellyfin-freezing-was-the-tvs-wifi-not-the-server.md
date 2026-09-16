---
title: Jellyfin Freezing Was the TV's Wifi, Not the Server
date: 2026-09-01
duration: intermittent over several days
tags: [Jellyfin, Networking, LG TV, Monitoring, False Alarm]
---

## What happened

Jellyfin playback kept freezing on the living room LG TV — the kind of intermittent, hard-to-pin-down issue that immediately points at the server: storage, CPU, the network path, Longhorn (given the July memory-leak incident on the same stack). Every server-side signal was checked live and came back clean.

## Root cause

The server was never the problem. Isolated to the TV's own wifi and WebOS buffering behavior — nothing in the server's CPU, storage I/O, or network path correlated with the freezes. Server, storage, network, and CPU were all ruled out with live checks before landing on the TV itself as the actual cause.

## Fix

No server-side fix, since there was nothing server-side to fix. Added a `NodeRebooted` Prometheus alert rule (bringing the total to 29 rules) as an incidental improvement from the investigation — not a fix for this specific issue, but useful signal for the next time a node-level event needs ruling in or out quickly.

## Prevention

Worth remembering for next time: an intermittent playback issue on one specific client device is not automatically a server issue, especially right after a server-side incident (July's memory leak) primes the instinct to look there first. Check the client's own network health early, not last.
