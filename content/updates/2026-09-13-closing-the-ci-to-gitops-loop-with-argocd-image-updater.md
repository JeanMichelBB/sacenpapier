---
title: Closing the CI-to-GitOps Loop with ArgoCD Image Updater
date: 2026-09-13
duration: one day
tags: [ArgoCD, GitOps, CI/CD, Security]
---

## What shipped

All 6 apps switched from SSH-triggered deploys to ArgoCD Image Updater. CI now pushes images tagged by the commit SHA instead of reusing `:latest`; Image Updater detects the new tag, writes it into each app's `kustomization.yaml`, and ArgoCD syncs it like any other git change. The `appleboy/ssh-action` step — and the `SSH_HOST`/`SSH_USER`/`SSH_PRIVATE_KEY` secrets behind it — is gone from all 6 workflows.

## Why

The fleet was split-brain: ArgoCD managed manifests from git, but the actual running image was decided by GitHub Actions SSHing into `elitedesk` and running `kubectl rollout restart` — a path ArgoCD never saw, so its "Synced" status didn't reflect what was actually deployed. Worse, checking `elitedesk`'s auth logs to clean up the SSH secrets surfaced something unrelated but more serious: the key those 6 repos had been using as their CI credential since March 2026 wasn't a dedicated deploy key at all — it was the personal MacBook's own SSH key, sitting as a plaintext GitHub secret in every repo.

## How it's set up

ArgoCD Image Updater 1.3.1, GitOps-tracked from install this time (static rendered chart manifests committed to `homelab-sacenpapier/k3s/`). A per-app `ImageUpdater` CR lives in each app's own repo, using a fine-grained GitHub PAT scoped to exactly the 6 repos for git write-back. `Apercu` was the pilot: CI pushes `${{ github.sha }}`-tagged images, a `kustomization.yaml` `images:` transformer pins them, and Image Updater's `newest-build` strategy picks up the new tag and commits the bump itself — verified end-to-end by watching a real `argocd-image-updater`-authored commit land and the Deployment roll to the exact sha-pinned image with zero disruption.

Rolling out to the other five caught one real pre-existing bug: `botwhy`'s backend had been importing `httpx` without it in `requirements.txt` for 29 days, invisible because the old pod predated the commit that added the import and nothing had force-redeployed `main` since. The sha-tag change finally forced a real rebuild, which crash-looped until `httpx` was added — the old pod kept serving the whole time, so zero user-facing outage.

Once all 6 apps were confirmed running exact sha-pinned images through the full loop, the SSH step was deleted from every workflow. Checking the auth logs first (rather than just deleting blind) is what surfaced the personal-key finding: the two dedicated CI-labeled `authorized_keys` entries had never once authenticated in the retained log window, while the real CI traffic all matched the user's own laptop key. Deleting the now-unused secrets was an easy call; rotating the still-daily-used personal key itself was flagged as its own follow-up rather than rushed.

## What's next

Rotating the personal SSH key that was exposed as a CI secret in 6 repos for roughly six months — a bigger decision than a secret deletion, tracked separately.
