---
title: BotWhy — The Mobile Viewport Fight
date: 2026-07-03
duration: 2 days, multiple reverts
tags: [BotWhy, Mobile, CSS]
---

## What shipped

Eventually landed: a stable mobile layout where the chat input stays anchored at the bottom and the header stays sticky even when the on-screen keyboard opens.

## Why

Mobile keyboards resize the visual viewport in ways that are notoriously inconsistent across browsers — a layout that looks correct on desktop can end up with the input bar hidden behind the keyboard, or the page double-shrinking, on a phone.

## How it's set up

Went through two full revert cycles before landing: `fix: shrink layout when mobile keyboard opens via visualViewport API` → reverted → `fix: remove --app-height from app-layout to prevent double-shrink` → also reverted → before the final version that adjusted `touch-action` and overflow behavior directly rather than fighting the viewport API.

## What's next

This kind of fight — try an approach, ship it, discover it's wrong on a different device, revert, try again — doesn't show up in a changelog as cleanly as a feature does, but it's real engineering time and worth naming honestly rather than smoothing over.
