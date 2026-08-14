---
title: BotWhy — Migrating Google Auth to FedCM
date: 2024-08-06
duration: one day
tags: [BotWhy, Auth, Migration]
---

## What shipped

Migrated BotWhy's Google sign-in from the old Google Identity Services flow to FedCM (Federated Credential Management), the new browser-native standard for federated login.

## Why

Google deprecated the old identity API this migration replaced — not an optional upgrade, the old flow was on a path to stop working in supported browsers. A forced platform migration, not a feature choice.

## How it's set up

FedCM shifts the sign-in prompt into a browser-native UI instead of a third-party script-rendered one, which changes both the integration surface and what the user actually sees during login.

## What's next

This landed early in BotWhy's life, well before the credit system, admin UI, and voice mode that came later — auth has been stable since.
