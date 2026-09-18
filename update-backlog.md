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

## Apercu

- [x] ~~Fictional timeline rotation~~ — **not shipped**: only a design spec + implementation plan
  exist (`docs/superpowers/specs/` and `/plans/`, both 2026-08-14); `day_offset`/
  `refresh_seeded_dates` were never actually added to `fastapi-backend/models.py`/`seed.py`. Not an
  Update candidate. Checked off as resolved (investigated, correctly not written up), not shipped.

## Legacy / origin infra

- [x] Early production infra: Terraform (OCI network + cluster) + Ansible deploy for BotWhy on Oracle Cloud, before the migration to the k3s homelab — 2025-03-05 through 2026-03-05 (`infra/OCI/oci-terraform-network`, `oci-terraform-cluster`, `oci-product-service`)

## Notes / skipped

- `infra/homelab` has no commit history (working tree is fully uncommitted/staged) — can't mine
  it via git log. Its `docs/*.md` incident writeups look like they already fed the Postmortems
  section, not Updates. Revisit only if the user wants something specific documented from it.
- BotWhy, PopRoom, and the rest of Apercu/x feature history is already well covered by existing
  Update posts — no further gaps found there.
- `sacenpapier` (the hub itself) and `shared-mysql`'s own repo history are mostly meta/plumbing
  already reflected in other Updates (GitOps rollout, per-app MySQL users) — no standalone
  candidate worth adding.
