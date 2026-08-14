---
title: BotWhy — Getting CI/CD Working the Hard Way
date: 2024-11-02
duration: ~1 week of iteration
tags: [BotWhy, CI/CD, GitHub Actions]
---

## What happened

The first attempt at a working GitHub Actions deploy pipeline for BotWhy took a long, visible trail of small failed commits over about a week — SSH connection failures, Docker build errors, `git pull` conflicts, React build issues — each fixed one at a time until the pipeline finally ran clean.

## Root cause

There wasn't one single root cause — this was the ordinary cost of standing up a real CI/CD pipeline for the first time: SSH key setup, known-hosts trust, Docker Compose install on the runner, image tagging syntax, and the interaction between all of them, each surfacing only once the previous one was fixed.

## Fix

Worked through it commit by commit: `test SSH connection` → `debug ssh connection` → `fix ssh` → `add know host` → `fix exact path`, then a second wave on the build side: `fix react build` → `fix react force-recreate` → `fix npm run` → `fix rm -rf dist/*` → `try npm run clean` → `fix git pull origin main`. No shortcuts — each fix was small and specific to what had just failed.

## Prevention

This pipeline has run without needing this kind of rescue since. The pattern that emerged — and that shows up again in every app onboarded after this one — was copying a known-working `deploy.yml` from an already-working repo rather than building each new one from scratch, which is exactly why BotWhy, PopRoom, Apercu, and x all share the same workflow shape today.
