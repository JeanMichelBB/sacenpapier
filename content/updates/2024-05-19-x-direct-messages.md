---
title: x — Direct Messages
date: 2024-05-19
duration: 5 days
tags: [x, Messaging]
---

## What shipped

Direct messages between users: a `Message` model and FastAPI router (send, list by user, delete), a Messages page with a threaded `MessageList`, and a compose flow — `ComposeMessageForm` wired to the existing user search so a conversation starts by searching for someone rather than needing an existing thread first.

## Why

Following and posting only get an X clone so far — messaging was the next core surface expected of a social app, and the one that turns a following graph into actual conversations between two users.

## How it's set up

Messages are stored per sender/recipient pair with a timestamp, queried per-user by unioning sent and received rows and sorting by `date_sent`. Composing a new message reuses the same `Search` component already built for finding users to follow, extended to support starting a conversation from a search result. The feature landed in stages over the week: the data model and basic send/receive first, then search-driven composing, then styling passed over the whole flow.

## What's next

The Messages page's right panel later got a layout fix — expanding to fill available space instead of a fixed 320px — once the rest of the app's panel-based layout patterns had matured.
