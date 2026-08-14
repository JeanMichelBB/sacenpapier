---
title: x — Rename from twitterclone, Cookie Consent, Auto-Logout
date: 2026-03-21
duration: one day
tags: [x, Rebrand, Privacy]
---

## What shipped

Renamed the project from "twitterclone" to "x" across the README, HTML files, and deployment configuration, added a CookieBanner component, and wired up auto-logout on any 401/403 response from the backend.

## Why

The project had outgrown its working title, and needed a real name matching what it had become. Cookie consent and auto-logout were separate housekeeping — closing gaps a demo project can skip but a live one shouldn't.

## How it's set up

The rename touched naming references only, not architecture — same FastAPI backend, same React frontend, same k3s manifests, just correctly named. Auto-logout hooks into the app's existing fetch layer, triggering on any auth failure rather than requiring each call site to handle it individually.

## What's next

This is also around when scroll-position restoration and header visibility toggling landed, rounding out the app's UX polish pass for that period.
