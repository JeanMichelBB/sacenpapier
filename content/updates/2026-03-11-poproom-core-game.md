---
title: PopRoom — Building the Core Game
date: 2026-03-11
duration: a few days
tags: [PopRoom, Canvas, WebSockets]
---

## What shipped

The foundational gameplay loop for PopRoom: camera follow and viewport adjustments, zoom and touch controls, stickman idle/movement animation, a WebSocket ping-pong mechanism to keep connections alive, and — a few days later — a janitor NPC that periodically cleans up the popped-balloon pile.

## Why

PopRoom is a real-time multiplayer canvas game; the core loop (see other players move, pop balloons together, watch the pile grow) had to feel responsive before any of the later polish (park generation, wildlife, auto-pop timers) would matter.

## How it's set up

React + Canvas API on the frontend, FastAPI + WebSockets on the backend, with the pile persisted to MySQL so it survives across sessions — architecture that's stayed unchanged since.

## What's next

Everything after this — the mountain-pile physics, park generation with boulders and wildlife, the connection-retry UX — built directly on this initial loop rather than replacing it.
