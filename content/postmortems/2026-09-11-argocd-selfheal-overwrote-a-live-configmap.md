---
title: ArgoCD selfHeal Overwrote a Live ConfigMap
date: 2026-09-11
duration: brief, caught same session
tags: [ArgoCD, GitOps, Kustomize, k3s, Data Loss]
---

## What happened

A live, in-use ConfigMap got silently overwritten by ArgoCD's selfHeal — not from a bad edit to the real config, but from a template file that was never meant to be applied at all.

## Root cause

The `k3s/` directory in the repo had no `kustomization.yaml` explicitly listing which manifests to apply, so ArgoCD applied every `.yaml` file it found in the directory — template included. A `.example.yaml` file, meant purely as a reference template for setting up the real config, happened to share `metadata.name` with the actual live ConfigMap. The moment that template landed in git, ArgoCD's selfHeal treated it as the source of truth and overwrote the real one with the template's placeholder values.

## Fix

Removed the naming collision and started the broader migration to an explicit `kustomization.yaml` per repo (see [the Kustomize-migration update](/updates/2026-09-13-kustomize-migration-for-k3s-and-argocd)) so ArgoCD only ever applies a named allowlist of manifests instead of blind-globbing a directory.

## Prevention

Any `.example.*` or template file living in the same directory ArgoCD watches is a live footgun as long as that directory has no explicit resource allowlist — the template doesn't need bad values to cause damage, it just needs to share a name with something real. The explicit `kustomization.yaml` migration closes this off structurally rather than relying on remembering to avoid name collisions by hand.
