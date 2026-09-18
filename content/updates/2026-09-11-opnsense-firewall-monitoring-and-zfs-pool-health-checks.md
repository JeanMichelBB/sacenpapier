---
title: OPNsense Firewall Monitoring and ZFS Pool Health Checks
date: 2026-09-11
duration: one day
tags: [Prometheus, Homelab, Observability]
---

## What shipped

Two monitoring gaps closed the same day: firewall-level visibility into OPNsense (previously host-level only), and a ZFS pool health check for TrueNAS — the single most important alert missing for a mirrored pool.

## Why

Both were real blind spots, not hypothetical ones. OPNsense monitoring only knew the host was up, not what the firewall itself was doing — interfaces, DHCP leases, firmware status, pf stats. And TrueNAS had no alerting at all on pool health, the one failure mode that actually matters for a mirror.

## How it's set up

`opnsense-exporter` runs in Docker on the monitoring Pi, authenticating as a dedicated read-only API user with no config-write access. Interfaces, ARP, DHCP leases, cron jobs, firmware status, and pf firewall stats all verified live with zero endpoint errors. Gateway status needed a workaround: the exporter's own gateway collector hits a confirmed upstream OPNsense API bug — a field returns the wrong JSON type specifically when mixing a static gateway with a dynamic one, exactly this network's setup. A small standalone poller hits the same endpoint directly instead, since it returns clean data outside the exporter's strict struct parsing, and forwards gateway-down straight into the existing Alertmanager/Discord pipeline.

For TrueNAS, a poller runs every 5 minutes against the pool and alert-list APIs and relays anything unhealthy — a pool not `ONLINE`, or a native TrueNAS alert at warning severity or above — into the same Alertmanager pipeline. Verified live against a real active alert, not just deployed and assumed working.

## What's next

Both integrations were migrated off TrueNAS's deprecated REST API the same night, once the ZFS check surfaced the same transport-security requirement the dashboard's own TrueNAS integration hit.
