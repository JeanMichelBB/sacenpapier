---
title: x — Lists, Explore, Bookmarks, and Notifications
date: 2026-07-28
duration: one day
tags: [x, Features]
---

## What shipped

Four features landed in a single push: Lists (create/delete, member viewing, with its own backend models and router), an Explore page backed by a new trending-tweets endpoint, Bookmarks (per-tweet toggle plus a dedicated page), and Notifications (triggered by likes, retweets, comments, and follows) — replacing what had been placeholder "coming soon" pages.

## Why

These four had been stubbed out as ComingSoon routes for a while; this was the push that actually built them out, turning the app from "core tweet/follow/message loop" into something closer to feature parity with a real social app.

## How it's set up

A shared `PageHeader` component got extracted to keep the four new pages visually consistent, notification triggers hook into the existing like/retweet/comment/follow actions rather than being a separate system, and a real pytest + FastAPI TestClient test suite was added alongside — retweet, comment, and follow notification coverage included.

## What's next

A quiet but important bug shipped as part of this same batch — see the postmortem on the database bootstrap ordering issue found and fixed the same day.
