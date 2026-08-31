---
title: Homelab Shutdown Cascade — NIC Swap, Docker Down, and Stale Port Forwards
date: 2026-08-31
duration: ~4h intermittent
tags: [homelab, docker, networking, DNS, DHCP, OPNsense, TrueNAS, elitedesk]
---

## What happened

A routine homelab shutdown (elitedesk → TrueNAS → OPNsense) turned into a multi-hour recovery after several independent issues compounded: `docker compose down` removed all 19 containers on elitedesk instead of just stopping them; elitedesk was moved from its onboard gig NIC to a new USB 2.5GbE adapter mid-session, changing its LAN IP from `.60` to `.99`; TrueNAS and OPNsense both power-cycled unexpectedly on their own; and the ISP router's port-forward rules (pointing at elitedesk's old `.60` IP) went stale, taking `jellyfin.sacenpapier.org`, `seerr.sacenpapier.org`, `ssh.sacenpapier.org`, and `mc.sacenpapier.org` down externally even after all services were healthy internally.

## Root cause

Several distinct causes stacked on top of each other:

1. **`docker compose down` before shutdown removes containers, not just stops them.** All 6 compose stacks were brought down cleanly before powering off elitedesk, which deletes containers *and* their Docker networks. When elitedesk came back up (once via a UPS/power event, once via a real reboot), nothing auto-restarted — Docker had nothing left to restart.
2. **Freshly-recreated Docker networks can get broken DNS.** When a network is created immediately after the daemon restarts, Docker sometimes falls back to writing the host's `127.0.0.53` (systemd-resolved stub, unreachable from inside a container netns) into `resolv.conf` instead of its own embedded `127.0.0.11` proxy. This hit `hermes_default` specifically, causing `hermes-gateway` to crash on startup with a Discord DNS resolution failure while still showing as "running" (s6 supervisor stayed up even though the app died).
3. **Stack redeploy ordering.** The `Homepage` stack declares `media_default` as an external network; redeploying stacks in the wrong order made `homepage` fail to start until `Media` was brought up first.
4. **A leftover native service duplicated a Dockerized one.** A pipx-installed `hermes-dashboard.service` (systemd `--user` unit) was still enabled and auto-started on boot, binding port 9119 before the `hermes-gateway` container could — a stale artifact from before the service was containerized.
5. **Moving to the 2.5GbE USB adapter changed elitedesk's LAN IP** from `192.168.3.60` to `192.168.3.99` (fresh DHCP lease, no reservation existed yet). Several places had this IP hardcoded: the ISP router's NAT port-forward rules (external HTTPS/SSH/Minecraft access), and `gpu-proxy`'s own source (`main.py`, `gpu-agent.ps1`, `test_gaming_guard.sh`) for its self-SSH Hermes-fallback toggle and the Windows agent's proxy URL.
6. **OPNsense turned out to be a transparent bridge firewall with zero NAT rules** — actual port forwarding lives on the ISP modem/gateway, a device outside this troubleshooting's reach via SSH. That device forwards by static LAN IP, so it silently broke the moment elitedesk's IP changed.
7. TrueNAS and OPNsense rebooting on their own (both showing ~4–9 min uptime, unprompted) was never root-caused — likely a UPS event, but no UPS event log was checked.

## Fix

- Redeployed all 6 docker-compose stacks in dependency order (Media before Homepage) after each unexpected restart.
- Recreated `hermes-gateway` specifically to pick up a healthy `127.0.0.11` DNS config once the daemon had fully settled.
- Disabled the leftover `hermes-dashboard.service` (`systemctl --user disable`) so only the container owns port 9119.
- Set a DHCP reservation on the ISP router for the 2.5GbE adapter's MAC (`00:E0:4C:68:00:A2`) → `192.168.3.60`, then force-renewed the lease (`ip link set down/up`, since this system uses `systemd-networkd`/netplan, not `dhclient`) to reclaim the original IP immediately rather than waiting for the next natural lease renewal.
- Configured netplan with both NICs defined and explicit route metrics (2.5GbE preferred at metric 100, onboard gig as automatic fallback at metric 200), so priority survives future cable swaps without manual reconfiguration.
- Reverted the `gpu-proxy` hardcoded-IP fix (mistakenly bumped to `.99` mid-incident) back to `.60` and rebuilt the image, since `main.py` is baked in at build time rather than volume-mounted.
- Verified the Windows-side `gpu-agent.ps1` deployment (`C:\gpu-agent\`) was unaffected — it already had `.60` hardcoded and was never touched by the mid-incident IP churn.
- Confirmed all four external domains reachable again purely as a side effect of moving elitedesk back to its original `.60` IP — no port-forward rule changes were needed once the address matched again.
- Verified TrueNAS pool health (`main` pool ONLINE, no degradation) and OPNsense's firewall/DNS/interface state post-reboot; both came back healthy despite the unexplained power event.

## Prevention

- **Never run `docker compose down` as part of a routine shutdown.** All 19 containers already run `restart: unless-stopped` with Docker enabled on boot — a plain `shutdown -h now` is sufficient and lets everything restart automatically and correctly, without deleting networks or triggering the DNS race.
- **DHCP reservations should exist before, not after, hardware/NIC changes.** The 2.5GbE adapter is now reserved to `.60`; the onboard gig NIC's MAC should get the same treatment as a documented fallback IP.
- **Audit for hardcoded LAN IPs across the fleet.** `gpu-proxy` had the elitedesk IP baked into three separate files; a single environment variable (already partially used via `WINDOWS_LAN_IP`) would have made this a one-line fix instead of a multi-file `sed`.
- **Document that the ISP modem/gateway — not OPNsense — owns NAT/port-forwarding.** OPNsense here is a transparent bridge with no NAT rules at all; anyone troubleshooting external reachability needs to check the ISP device first, not OPNsense.
- **Investigate the UPS/power event** that rebooted TrueNAS and OPNsense unprompted — no root cause was found this time, and it's the one open thread from this incident.
