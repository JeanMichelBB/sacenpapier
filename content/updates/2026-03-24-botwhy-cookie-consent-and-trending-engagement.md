---
title: BotWhy — Cookie Consent and Trending Engagement
date: 2026-03-24
duration: one day
tags: [BotWhy, React, FastAPI]
---

## What shipped

A `CookieConsent` component for the frontend, and a real rewrite of how trending conversations track likes and comments: per-user like tracking (instead of a bare counter), unlike, and comment add/delete endpoints.

## Why

Cookie consent was compliance housekeeping. The trending-conversation rework was closer to a bug fix wearing a feature's clothes: the old `like` endpoint trusted a client-supplied `user_id` and only tracked a raw count, so nothing stopped the same user from liking a conversation repeatedly by resending the request with a different `user_id`, and there was no comment functionality at all.

## How it's set up

Likes now store the actual list of user IDs who liked a conversation (`liked_by`) rather than just an incrementing count, derived from the authenticated `current_user` instead of a request parameter — closing the double-like path entirely, and making unlike possible for the first time since the API can now check whether a specific user already liked it. Comments follow the same authenticated pattern: `POST .../comment` appends `{user, text}`, `DELETE .../comment` removes by index. Both use SQLAlchemy's `flag_modified` since the underlying columns are JSON, which doesn't auto-detect in-place list mutations.

## What's next

Trending moderation (reporting, author-only deletion) and a schema fix for how reports are stored followed a few months later, once real usage started surfacing gaps in this first pass — [written up separately](/updates/2026-07-09-botwhy-trending-moderation).
