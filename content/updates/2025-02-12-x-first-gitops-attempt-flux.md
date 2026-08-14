---
title: x — First GitOps Attempt, FluxCD
date: 2025-02-12
duration: one commit
tags: [x, GitOps, FluxCD]
---

## What shipped

Added a `kustomization.yaml` for FluxCD to the `x` (then still called `twitterclone`) repo — the first attempt at GitOps on this infrastructure.

## Why

Manual `kubectl apply` deploys were already the norm across the fleet; Flux promised the same reconciliation model ArgoCD delivers today — git as the source of truth, automatic sync to the cluster.

## How it's set up

A single Kustomize-based Flux config, added alongside the still-new k3s manifests and namespace setup for this app.

## What's next

This didn't go further — no more Flux commits followed, and manual deploys plus GitHub Actions became the standing pattern for the next year and a half. The second attempt at GitOps came via ArgoCD, and it stuck — see the postmortem on the naming collision hit during that rollout, and the update on the per-app MySQL security hardening that followed it.
