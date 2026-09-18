# sacenpapier Updates — Backlog

Survey of every repo under `02_Work/Projects` (READMEs + `git log --oneline`, cross-referenced
against `apps/sacenpapier/content/updates/*.md`) to find shipped work not yet written up as an
Update. Built 2026-09-18. Source of truth for the fleet-wide infra items is
`homelab-platform-todo.md` (numbered backlog items #1-21) — read the relevant item's full detail
section there before writing, then confirm against the actual repo's git log/code.

Work top to bottom. Check an item off and commit that checkbox update as soon as its Update ships.

## Fleet-wide infra (all/most of the 6 apps + shared-mysql, from homelab-platform-todo.md)

- [x] Doppler secrets management rollout across the fleet — backlog item #1, 2026-09-13
- [x] Shared observability pattern: `/metrics` + per-app business gauges — backlog item #3, 2026-09-13
- [x] Blackbox Exporter for all 6 public URLs — backlog item #4, 2026-09-13
- [ ] ArgoCD Image Updater — closing the CI/GitOps loop (git-sha tags, drop SSH deploy) — backlog item #5, 2026-09-13
  **On hold**: draft written but not shipped — the accurate write-up reveals that the CI secrets in
  all 6 repos turned out to be the personal MacBook's own SSH key, still valid/in daily use and not
  yet rotated (see backlog item #21). Publish only after that key is rotated. Draft sits untracked
  at `content/updates/2026-09-13-closing-the-ci-to-gitops-loop-with-argocd-image-updater.md`.
- [x] Distributed tracing with OpenTelemetry, exported to Tempo — backlog item #14, 2026-09-13
- [x] Container image vulnerability scanning with Trivy in CI — backlog item #10, 2026-09-14
- [x] Kubernetes resource requests/limits audit across every Deployment — backlog item #11, 2026-09-14
- [x] Privilege scoping: homelab-dashboard + kube-system/prometheus ServiceAccounts off `cluster-admin` — backlog items #18 + #19, 2026-09-13

## homelab-sacenpapier (dashboard)

- [x] TrueNAS integration migrated from REST to JSON-RPC 2.0/WebSocket (cert fix, API key churn) — backlog item #8, 2026-09-12
- [x] OPNsense firewall-level monitoring + TrueNAS ZFS pool health check added to the Pi's monitoring stack — backlog items #6 + #7, ~2026-09-11
- [x] OpnSense page + Glances-based Windows node monitoring added to the dashboard UI — 2026-04-20 to 2026-05-02

## x

- [x] Direct messages: search + send, styled — 2024-05-14 to 2024-05-19
- [x] Building the core app: layout, tweets, follow/following, likes, suggestions, profile — 2024-05-12 to 2024-05-28 (deeper-pass find, 2026-09-18)
- [x] Retweets + comment overlay, Status/Coming-Soon pages, profile background picture — 2026-03-21 (deeper-pass find, 2026-09-18)

## BotWhy

- [x] Building the core chat app: conversation API, first chatbox pages, validation, mobile, docker — 2024-08-11 to 2024-08-16 (deeper-pass find, 2026-09-18)
- [x] Cookie consent + comments/likes on trending conversations — 2026-03-24 (deeper-pass find, 2026-09-18)
- [ ] Rate limiting + message length validation on the AI endpoint (`slowapi`, 20/min) — 2026-07-03
  (skill-list audit find, 2026-09-18)

## Apercu

- [x] Building the core app: CRA prototype, then a real Docker/React/FastAPI/MySQL rebuild — agent DB interface, contact-by-email, hashed passwords, an early forget-password page — 2023-11-18 to 2024-06-04 (deeper-pass find, 2026-09-18)
- [x] Marketing site: bilingual (en/fr) landing page with Service/Pricing/Basic-Intermediate-Advanced tiers, in a separate `first-look` app — 2024-09-12 to 2024-09-16 (deeper-pass find, 2026-09-18)
- [x] ~~Fictional timeline rotation~~ — **not shipped**: only a design spec + implementation plan
  exist (`docs/superpowers/specs/` and `/plans/`, both 2026-08-14); `day_offset`/
  `refresh_seeded_dates` were never actually added to `fastapi-backend/models.py`/`seed.py`. Not an
  Update candidate. Checked off as resolved (investigated, correctly not written up), not shipped.

## Live infra (found by SSHing into each host, not in any git repo)

Survey done 2026-09-18 per `~/.ssh/config`: tselitedesk (k3s master + media/tools docker host),
tspi (k3s-external monitoring stack), tstruenas (storage), tsopnsense (firewall/networking),
tsoci-node-1/2 (pure k3s workers, nothing extra running). Cross-checked each finding against both
Updates and Postmortems before adding here, to avoid re-documenting something already written up.

- [x] Nightly config backup: elitedesk + tspi each cron a script that pulls live config (docker-compose,
  Prometheus/Alertmanager configs, Grafana dashboards via API export, crontab) back into the
  `homelab` git repo, secrets redacted, and commits+pushes automatically — 2026-09-18 (live-infra find)
- [x] Two-tier Watchtower auto-updates: stateful/user-data containers (Sonarr, Radarr, Jellyfin, qBittorrent,
  etc.) kept on monitor-only, with a custom script that parses Watchtower's logs and fires a real
  Alertmanager alert for pending manual-review updates — 2026-09-18 (live-infra find)
- [x] `longhorn-webhook-watchdog.sh`: detects Longhorn's `webhook ... context deadline exceeded` failure
  signature in the manager logs and auto-deletes the stale validating/mutating webhook configs so
  Longhorn re-registers itself — 2026-09-18 (live-infra find)
- [x] ~~UPS/NUT power monitoring~~ — **not shipped yet**: `os-nut` plugin installed on OPNsense and
  nut-exporter/nut-client containers running on elitedesk, but `upsc` returns "Connection refused"
  and OPNsense's `ups` service isn't running — genuinely in progress, not functional. Not an Update
  candidate until it actually reports real UPS data.
- [x] ~~docker-watchdog.sh~~ — **already documented**, as the Prevention section of
  [prometheus-alertmanager-silently-stopped-restarting](../content/postmortems/2026-06-27-prometheus-alertmanager-silently-stopped-restarting.md)
  (a Postmortem, not an Update). Not re-documented here.
- Skipped as not recruiter-relevant / not real engineering to write up: the Jellyfin/Sonarr/Radarr/
  Prowlarr/qBittorrent/Gluetun/Seerr/byparr media stack (off-the-shelf hobbyist setup), Portainer
  (installed, not built), graphite_exporter/cadvisor (feed a personal Minecraft/container-metrics
  dashboard, not distinctive), Uptime Kuma (redundant with the already-documented Blackbox Exporter).

## Legacy / origin infra

- [x] Early production infra: Terraform (OCI network + cluster) + Ansible deploy for BotWhy on Oracle Cloud, before the migration to the k3s homelab — 2025-03-05 through 2026-03-05 (`infra/OCI/oci-terraform-network`, `oci-terraform-cluster`, `oci-product-service`)

## Notes / skipped

- `infra/homelab` has no commit history (working tree is fully uncommitted/staged) — can't mine
  it via git log. Its `docs/*.md` incident writeups look like they already fed the Postmortems
  section, not Updates. Revisit only if the user wants something specific documented from it.
- A deeper full-history pass on BotWhy and x (2026-09-18) found 4 gaps, shipped; both repos'
  remaining commits (credit system, admin UI, voice mode, trending moderation, notifications/
  lists/explore/bookmarks) are already covered. A same-day deeper pass on PopRoom (38 commits, all
  already covered — no gaps) and Apercu (73 commits) found 2 more gaps in Apercu, added above.
- `sacenpapier` (the hub itself) and `shared-mysql`'s own repo history are mostly meta/plumbing
  already reflected in other Updates (GitOps rollout, per-app MySQL users) — no standalone
  candidate worth adding.
