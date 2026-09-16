---
title: Kustomize Migration for k3s and ArgoCD
date: 2026-09-13
duration: ongoing
tags: [ArgoCD, GitOps, Kustomize, k3s]
---

## What shipped

An explicit `kustomization.yaml` per repo's `k3s/` directory, replacing ArgoCD's previous behavior of applying every `.yaml` file it found there. `homelab-sacenpapier` is done; `sacenpapier`, `Apercu`, `BotWhy`, `PopRoom`, and `x` are in progress.

## Why

Directly prompted by the September 11th incident, where a `.example.yaml` template file happened to share a name with a real ConfigMap and got silently applied over it by ArgoCD's selfHeal, since nothing told ArgoCD which files it should actually be watching.

## How it's set up

Each repo's `k3s/kustomization.yaml` now explicitly lists its real manifests, so ArgoCD applies exactly that allowlist instead of blind-globbing the directory. Any template, example, or draft file living alongside the real manifests is now inert by default rather than a name collision away from landing in production.

## What's next

Roll the same migration out to the remaining repos (`sacenpapier`, `Apercu`, `BotWhy`, `PopRoom`, `x`).
