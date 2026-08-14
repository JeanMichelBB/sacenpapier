---
title: PopRoom — Park Generation
date: 2026-07-11
duration: 2 days
tags: [PopRoom, Canvas, Procedural]
---

## What shipped

Procedural park generation for PopRoom's canvas — decor rendering, boulders, and wildlife (rabbits and birds) scattered across the play space, plus improved WebSocket error handling and a proper launch configuration for running frontend and backend together.

## Why

The core balloon-popping gameplay had been stable since March; this was about making the world itself feel alive rather than a blank canvas, four months into the project's life.

## How it's set up

Seeded random generation (already used for balloon placement scatter) extended to place park decor and wildlife, layered on top of the existing camera-follow and zoom system from the original build.

## What's next

The resize-handling logic in `GameCanvas` got simplified right after, once the added decor layer made the existing handling feel more complex than it needed to be.
