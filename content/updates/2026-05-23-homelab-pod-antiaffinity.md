---
title: HomeLab Dashboard — Pod Anti-Affinity Across Nodes
date: 2026-05-23
duration: small change
tags: [Homelab, k3s, Reliability]
---

## What shipped

Added `podAntiAffinity` to the homelab dashboard's frontend deployment, so its three replicas spread across different nodes instead of potentially landing on the same one.

## Why

Without anti-affinity, Kubernetes' scheduler can place all replicas of a deployment on a single node — which defeats the point of running multiple replicas for availability, and undercuts the dashboard's own "which node served this" feature if every request could only ever come from one machine.

## How it's set up

A `podAntiAffinity` rule on the frontend Deployment spec, preferring (or requiring) that replicas avoid co-locating on the same node.

## What's next

Same day this landed elsewhere in the fleet: MySQL got pinned to `elitedesk` specifically via `nodeSelector` across several apps — the opposite instinct applied correctly, since a stateful single-replica database benefits from a fixed, known node rather than being spread around.
