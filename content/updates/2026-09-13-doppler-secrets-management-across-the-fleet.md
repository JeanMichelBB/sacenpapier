---
title: Doppler Secrets Management Across the Fleet
date: 2026-09-13
duration: one day
tags: [Doppler, Secrets, Kubernetes, GitOps]
---

## What shipped

Every app that actually holds secrets — Apercu, BotWhy, PopRoom, x, and homelab-sacenpapier — moved off hand-applied `k3s/secrets/*.yaml` files and onto the **Doppler Kubernetes Operator**. A `DopplerSecret` CRD per repo (safe to commit — no values, just a project/config reference) now syncs each app's real secrets from Doppler straight into the same Kubernetes Secret its Deployment already expects, with auto-reload on change.

## Why

Secrets were being hand-applied to the cluster with `kubectl`, gitignored, and easy to drift from what was actually running. Doppler was already in use for infra/Terraform (`AWS_*`, `GITHUB_TOKEN`, `TF_TOKEN`, etc.), so extending it into the cluster meant one secrets tool for the whole stack instead of standing up HashiCorp Vault or OCI Vault purely for the app layer — both of which were ruled out once Doppler was confirmed as the existing tool.

## How it's set up

The Doppler Kubernetes Operator runs cluster-wide via Helm (`doppler-operator-system`, 100m CPU / 256Mi mem, single replica). Five Doppler projects — `apercu`, `botwhy`, `poproom`, `x-clone`, `homelab-sacenpapier` — each hold a single `prd` config. Each app's `DopplerSecret` CRD is bootstrapped with a read-only Doppler service token (the one remaining manual secret, once per app rather than once per secret file), targets the existing managed Secret name, and joins that app's `kustomization.yaml`. No Deployment changes were needed for four of the five apps.

Auto-reload runs off a plain annotation on the target Deployment (`secrets.doppler.com/reload: "true"`) — the `DopplerSecret` CRD itself has no reload field. Verified in both directions on `poproom`: setting a throwaway key rolled a fresh pod within ~30s with no manual `kubectl`, and removing it triggered a second automatic restart.

`homelab-sacenpapier`, being the one public repo in the fleet, went further: its gitignored backend ConfigMap (Tailscale IPs, internal service URLs) was folded into the same Doppler project instead of being committed, and its `DopplerSecret` was widened to sync the whole project rather than an explicit key allowlist.

## What's next

Rotating every credential this migration briefly printed to a terminal transcript while populating and debugging the projects — the `K3S_BEARER_TOKEN`s were rotated as part of the work itself, but the app-level secrets (Stripe, Google OAuth, OpenRouter, Resend, Giphy, TrueNAS API key, DB passwords) still need rotating at their respective sources.
