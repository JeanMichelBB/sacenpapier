---
title: Homelab Dashboard — OpnSense Page and Windows Node via Glances
date: 2026-05-02
duration: a few weeks apart
tags: [Homelab, React]
---

## What shipped

Two small but real additions to the homelab dashboard: a dedicated `/opnsense` page describing the Protectli V1210 firewall's role and access, added with real client-side routing via a `Router` component; and a fix to how the Windows gaming node reports its stats, switching to the Glances HTTP API on its correct port.

## Why

The dashboard was a single-page app before this — the OpnSense page was the first real reason to introduce routing rather than keep bolting more sections onto one page. The Windows node fix was more mundane but necessary: it simply wasn't reporting real numbers before this, since the backend was hitting the wrong integration for that node's metrics.

## How it's set up

`OpnSensePage.tsx` documents the firewall's device info, network roles (WAN/LAN/DHCP/NAT), security features (stateful inspection, IDS/IPS, DNS over HTTPS), and monitoring/access details (Tailscale-only WebUI, SSH) — static content today, matching the site's existing card-based design system, reachable from the dashboard nav via `react-router-dom`. The Windows node's stats now come from Glances' HTTP API on port `61208`, fixed in `backend/app/routers/nodes.py` alongside the other 5 nodes' polling logic.

## What's next

The dashboard has continued to grow node integrations since — TrueNAS moved to JSON-RPC and the ClusterRole this backend runs under got scoped down to read-only, both written up separately.
