---
title: HomeLab Dashboard — Live Pod and Node Highlighting
date: 2026-04-20
duration: one day
tags: [Homelab, Dashboard, k3s]
---

## What shipped

The homelab dashboard's k3s section now shows which pod and node actually served the current request — visible directly on the page, with a rotate button to re-route and watch the highlight change — plus inline skeleton loading states across all live values instead of blank space while data loads, and light/dark mode.

## Why

A live infrastructure dashboard is more convincing when it can prove it's live — showing the actual serving pod/node, not just static labels, turns the page from a mockup into a real demonstration of the k3s cluster's replica routing.

## How it's set up

FastAPI backend, React frontend, data loaded via separate requests for nodes and k3s status so each section's skeleton resolves independently rather than blocking on the slowest one.

## What's next

Pod anti-affinity for the frontend replicas followed about a month later, spreading them across nodes so the "which node served this" demonstration actually reflects real distribution, not three replicas that happened to land on the same box.
