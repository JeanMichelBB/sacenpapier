---
title: Apercu — Password Reset and Email Flow
date: 2024-10-17
duration: a few days
tags: [Apercu, Auth, Email]
---

## What shipped

Forgot-password flow for Apercu's admin accounts, plus the email delivery path that sends the reset link.

## Why

Admin accounts (the ones managing events, speakers, and blog content) needed a self-service recovery path rather than requiring a manual database fix whenever a password was lost.

## How it's set up

Email sending goes through Gmail SMTP via a small `text_mail.py` helper, triggered on a reset request and consumed by a time-limited reset link.

## What's next

This became part of the core admin auth surface that later got API-key middleware layered on top, protecting every endpoint except docs and login.
