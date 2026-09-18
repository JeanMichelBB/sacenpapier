---
title: x — Retweets and Comment Overlays
date: 2026-03-21
duration: one day
tags: [x, React]
---

## What shipped

Retweets and a comment overlay landed on `TweetListUser`: a retweet label/action on each tweet, an overlay showing full tweet detail with comment submission and liking inside it, plus a new `Status` page for viewing an individual tweet and its comments directly, a `Coming Soon` page for unbuilt sections, empty-state handling in the Messages list, and a profile background picture.

## Why

Retweeting and commenting are core interaction loops for a social app that weren't there yet — up to this point tweets could only be liked, not amplified or discussed inline.

## How it's set up

The comment overlay is where the interaction lives: opening it surfaces the tweet's full detail with its comment thread, and comments and likes can both be submitted from inside it without navigating away. The new `Status` page gives each tweet a permanent, linkable location showing the same detail and comments outside the overlay — the shape a "view tweet" URL needs. Image upload styling was also cleaned up in the same pass (a dedicated upload button, preview, and remove control), and the still-unbuilt sections of the app got a real `Coming Soon` page instead of a broken route.

## What's next

This was the same day the project renamed from `twitterclone` to `x` and added cookie consent and auto-logout, [written up separately](/updates/2026-03-21-x-rename-and-cookie-consent) — a genuinely busy single day for the app.
