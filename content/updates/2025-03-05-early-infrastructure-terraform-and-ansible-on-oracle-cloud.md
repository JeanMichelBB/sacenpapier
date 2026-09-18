---
title: Early Infrastructure — Terraform and Ansible on Oracle Cloud
date: 2025-03-05
duration: one year
tags: [Terraform, Ansible, OCI, Infrastructure]
---

## What shipped

Before any of this became a k3s homelab, the fleet ran on Oracle Cloud free-tier instances provisioned by two Terraform repos — `oci-terraform-network` (VCN, subnet, security rules, an internet gateway, block storage) and `oci-terraform-cluster` (compute instances, including a later ARM instance) — with `oci-product-service`'s Ansible playbook handling the actual deployment: installing dependencies, running the Docker-based services, and updating Cloudflare DNS records on every deploy.

## Why

This was the first real production infrastructure for the project, a full year before the migration to a self-hosted k3s cluster. It's the baseline everything since — GitOps, Kustomize, Doppler, distributed tracing — was built to replace.

## How it's set up

Terraform defined the network layer (VCN, subnet, ingress/egress rules, internet gateway) and the compute layer (the OCI instance itself, later extended to an ARM-based free-tier instance) as two separate, iteratively-hardened repos — both went through dozens of small `feat:`/`fix:` commits tightening ports, storage sizing, and instance types over the following year. Ansible then took a bare instance to a running service: installing Docker, deploying BotWhy's backend/frontend/database containers, and wiring up GitHub Actions so a push to `main` triggered a full build-test-deploy cycle, with DNS updated automatically via the Cloudflare API as part of the same run.

## What's next

This whole stack was eventually superseded by the k3s + ArgoCD homelab setup — GitOps rollout, per-app Doppler secrets, and everything documented since replaced what these three repos did by hand.
