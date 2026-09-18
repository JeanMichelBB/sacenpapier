---
title: Scoping ServiceAccounts Off Cluster-Admin
date: 2026-09-13
duration: one day
tags: [Kubernetes, RBAC, Security]
---

## What shipped

Two ServiceAccounts running with full `cluster-admin` got scoped down to exactly the permissions they actually use: `homelab-dashboard`'s to read-only `get`/`list` on nodes and pods, and `kube-system`'s Prometheus SA to `get` on `/metrics` and `nodes/metrics` only.

## Why

Both were accidental discoveries, not a systematic RBAC review. Rotating a leaked bearer token during the same day's Doppler migration led to checking what that ServiceAccount could actually do — and it turned out to be bound to `cluster-admin` (every namespace, every resource, including delete and secrets-read) despite the dashboard's backend only ever calling `GET /api/v1/nodes` and `GET /api/v1/pods`, no writes anywhere in the codebase. Auditing that one turned up the Prometheus SA in the same state while looking around.

## How it's set up

For `homelab-dashboard`: the ServiceAccount itself was deleted and recreated first (a new UID immediately invalidates the leaked token, independent of the RBAC fix), then a minimal `ClusterRole` — `get`/`list` on `nodes`/`pods` only, no `watch` since the code only ever does a one-shot poll — replaced the `cluster-admin` binding, committed to git rather than left as a manual `kubectl apply`. Since `ClusterRoleBinding.roleRef` is immutable, the old binding had to be deleted before the new one could apply. Verified live with `kubectl auth can-i`: can list nodes and pods, cannot delete pods or read secrets.

For `kube-system`'s Prometheus SA: its `prometheus.yml` (running on the Pi, outside the cluster) uses a static bearer token to scrape exactly three endpoints — the apiserver's own metrics, kubelet metrics, and cadvisor — all via hardcoded static targets with no Kubernetes service discovery at all. That matters: it means no `list`/`watch` on pods or services is needed, so the real minimal RBAC is even tighter than a typical Prometheus setup — just `nonResourceURLs: ["/metrics"]` and `nodes/metrics`, the subresource that covers both the kubelet and cadvisor endpoints. Folded into `homelab-sacenpapier`'s manifests as the closest thing to a "cluster infra" app, rather than another undeclared manual apply. Verified by curling all three endpoints directly from the Pi with the real token — all returned `200`, zero scrape disruption.

A quick audit of the other 5 apps confirmed they were never at risk: none of them declare a custom ServiceAccount or talk to the Kubernetes API at all — they're plain web apps hitting MySQL, running as the bare `default` SA with zero bindings anywhere in the cluster.

## What's next

A few other `cluster-admin` bindings turned up in the same scan (Portainer, Longhorn's support bundle, Traefik's Helm-managed SA) — left alone as expected for what those tools actually do, not flagged as issues.
