---
title: BotWhy — Credit and Payment System
date: 2026-07-01
duration: ~3 days
tags: [BotWhy, Stripe, Payments]
---

## What shipped

A full pay-as-you-go credit system for BotWhy: Stripe checkout and webhooks, a credit ledger with transaction history, free credits on signup, a free-tier message allowance with a countdown, model restrictions for free-tier users, and a dedicated Credits page with pack selection and balance display.

## Why

BotWhy's AI calls cost real money per message via OpenRouter — a credit system was the only way to offer the app publicly without an open-ended cost exposure, while still giving new users enough free usage to actually try it.

## How it's set up

A `credit_transactions` table records every spend and grant; a `require_credits` dependency returns 402 when balance hits zero; Stripe webhooks are idempotent by design (covered by dedicated test coverage) so a retried webhook can't double-credit an account. Soft-deleted users keep their balance but can't re-claim the signup grant by re-registering.

## What's next

A `Charged` column showing total paid including fees landed a couple days later, and the mobile viewport/keyboard-shrink saga (a separate, harder-than-expected UI fight) ran in parallel right after.
