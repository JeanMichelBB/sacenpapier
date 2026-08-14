---
title: x — The Silent Database Bootstrap Bug
date: 2026-07-28
duration: caught same-day, no production impact
tags: [x, SQLAlchemy, Bug]
---

## What happened

While building four new features in one push (Lists, Explore, Bookmarks, Notifications), a database bootstrap function got called in the wrong order relative to model imports — and it failed with no error at all. Tables that should have existed silently didn't.

## Root cause

`create_or_rebuild_database()` builds tables from SQLAlchemy's `Base.metadata`, which only knows about model classes that have already been imported into memory at the point it runs. Called before the new models (`TweetList`, `TweetListMember`, and the rest) were imported, it had no way to know they existed — so it silently created nothing for them, and silently dropped nothing on any subsequent run either. No exception, no log line, just missing tables that would only surface as a confusing runtime error much further downstream, in whatever code path first tried to query them.

## Fix

Moved the call to after every model module is imported, with an explicit code comment now documenting why the ordering matters — a direct warning to the next person (including future-self) who might otherwise move this call for an unrelated reason and reintroduce the same silent failure.

## Prevention

This class of bug — a function that depends on import-order state it doesn't itself enforce or check — is exactly the kind that hides well in test suites too, since tests often import everything up front regardless of the app's real startup order. The comment left in place is the actual fix here as much as the reordering is: the code alone doesn't prevent recurrence, the explanation next to it does.
