---
title: GitOps Rollout — ArgoCD Across the Homelab Fleet
date: 2026-08-14
duration: one day
tags: [ArgoCD, GitOps, k3s, Homelab]
---

## What shipped

Moved all six apps in the fleet (PopRoom, BotWhy, x, Apercu, sacenpapier, homelab-sacenpapier) from manual `kubectl rollout restart` deploys to ArgoCD-managed GitOps. Every app's `k3s/` manifests are now the single source of truth — the cluster continuously reconciles against git and self-heals if anything drifts.

## Why

CI already handled the build-and-push side (GitHub Actions → Docker Hub multi-arch images), but rolling out to the cluster still meant SSHing in and running `kubectl rollout restart` by hand. ArgoCD closes that gap: manifest changes deploy on push, and any manual `kubectl edit` gets silently reverted within seconds — proven live with a real drift test (scaled a deployment by hand, watched ArgoCD revert it in under a second).

## How it's set up

ArgoCD runs in its own namespace, Tailscale-only (no public ingress — it has deploy-level access to the whole cluster, no reason for it to be internet-reachable). One `Application` per app repo, plus a dedicated `shared-mysql` repo for the one MySQL instance multiple apps connect to — moving that out of any single app's repo was the fix for a naming-collision incident hit partway through this rollout (see the postmortem for that one).

## What's next

Secrets management (SOPS or Sealed Secrets) is the natural next layer now that GitOps is stable — committing secrets in plaintext defeats a lot of the point once everything else is declarative.
