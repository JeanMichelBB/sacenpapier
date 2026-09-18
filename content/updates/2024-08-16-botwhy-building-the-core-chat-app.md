---
title: BotWhy — Building the Core Chat App
date: 2024-08-16
duration: about a week
tags: [BotWhy, React, FastAPI]
---

## What shipped

The founding build of BotWhy: a conversation/messages API, the first chatbox pages, request validation, a mobile-responsive layout, and the first Docker-based deployment — landing as one continuous week of work right after Google auth (and its [FedCM migration](/updates/2024-08-06-botwhy-fedcm-migration)) gave the app somewhere to attach a conversation to.

## Why

This is the actual starting point of BotWhy as a chat app, not just an authenticated shell — everything documented about it since (the credit system, admin UI, voice mode, trending moderation) was built on top of this first working conversation loop.

## How it's set up

The conversation and messages endpoints landed first (`chatbox.py`), followed within two days by what the commit history calls the "first complete version" — the actual OpenAI-backed reply endpoint (`openai.py`) and the user-facing pieces needed to drive it. Validation and a mobile-responsive pass followed once the core loop worked, and the whole thing was containerized and deployed within the same week — real production packaging from very early on, not an afterthought.

## What's next

The following months were mostly CI/deployment iteration (GitHub Actions, Kubernetes manifests, secret handling) rather than new product features — the app's next real feature work was the credit and payment system, documented separately, almost two years later.
