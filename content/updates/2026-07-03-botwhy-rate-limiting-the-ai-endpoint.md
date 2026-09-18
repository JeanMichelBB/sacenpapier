---
title: BotWhy — Rate Limiting the AI Endpoint
date: 2026-07-03
duration: same day
tags: [BotWhy, FastAPI, Security]
---

## What shipped

A per-IP rate limit (20 requests/minute via `slowapi`) and a 500-character message length cap on BotWhy's `/openai/answer` endpoint — the one route that actually calls out to a paid AI provider on every request.

## Why

Every hit to this endpoint costs real OpenRouter spend, on top of the credit system already gating it per-user. A per-user credit balance doesn't stop a single account (or a compromised one) from firing requests fast enough to be a real cost or availability problem before the credit deduction even has a chance to matter, and nothing capped how long a single message could be either.

## How it's set up

`slowapi`'s `Limiter`, keyed by remote address, wraps the endpoint with a straightforward `@limiter.limit("20/minute")` decorator — no separate service, no Redis-backed counter, just an in-process limiter appropriate for the traffic this app actually sees. The message-length check sits inline right before the credit/AI-call logic runs, so an oversized request gets rejected before anything downstream (credits, the AI call itself) is touched. Free-tier users were carved out of credit deduction in the same commit, so the rate limit — not the credit system — is what actually bounds their usage.

## What's next

The existing test suite needed patching to bypass `slowapi`'s internals cleanly, since a naive test client hitting the same endpoint repeatedly in a loop would otherwise trip the same limit real traffic is meant to hit.
