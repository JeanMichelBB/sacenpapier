---
title: x — Building the Core App
date: 2024-05-28
duration: about 3 weeks
tags: [x, React, FastAPI]
---

## What shipped

The founding build of what would become x: a three-section layout, tweets (post/view), follow/following with a suggestions feed, per-tweet likes, profile editing, a seeded database for local dev, and the first Docker-based deployment — all landing as one continuous build over the project's first three weeks, alongside direct messages ([written up separately](/updates/2024-05-19-x-direct-messages)).

## Why

This is the project's actual starting point — everything documented about x since (notifications, lists, explore, bookmarks, the rename to x, GitOps) was built on top of this initial core: React frontend, FastAPI backend, MySQL, the basic social graph and posting loop.

## How it's set up

Tweets, followers, and likes each got their own small FastAPI router (`tweets.py`, `followers.py`) added incrementally over a few days rather than as one monolithic feature — tweets first, then follow/following the next day, then likes layered onto the existing `TweetList` component the day after. A seeded database gave local dev realistic data to build the suggestions feed against without needing real signups. The whole stack shipped to a real server within the same three weeks — Docker config, a first GitHub Actions deploy workflow, and enough production hardening (connection pool sizing, API key protection, mobile layout) to actually run live.

## What's next

Styling passes (header, tweets, login, settings) followed in the same week once the functional core was in place, rounding out the first complete version.
