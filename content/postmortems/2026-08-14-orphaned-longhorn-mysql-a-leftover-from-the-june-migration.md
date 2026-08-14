---
title: Orphaned Longhorn MySQL — A Leftover From the June Migration
date: 2026-08-14
duration: 2+ months undetected
tags: [Longhorn, MySQL, Cleanup, Technical Debt]
---

## What happened

Auditing what was actually under ArgoCD turned up an unreachable but still-running MySQL instance (`mysql-longhorn`) holding real data. Its creation date and PVC name matched the Longhorn-backed instance from the June 2nd incident — migrated off in that fix, but never actually decommissioned.

## Root cause

The June 2nd postmortem's fix moved MySQL off Longhorn entirely, onto `local-path` storage, specifically so a future Longhorn failure couldn't take the database down again. That fix was correct and did its job — but cleanup stopped at "the app works again," not "the old instance is gone." `mysql-longhorn` kept running for over two months, invisible in normal operation because nothing pointed at it and it never caused an error. Checking its data showed it wasn't just an empty leftover either: row counts were close to but slightly behind the real instance's (`chatbox_db.messages`: 54 vs. 58 live, `credit_transactions`: 14 vs. 15 live) — meaning it kept receiving writes in parallel with the real instance for some time after the migration, before something stopped pointing at it roughly two days before this was found. What caused that final cutover isn't clear from the evidence available; it's possible another change silently completed the migration this postmortem's fix should have finished in June.

## Fix

Verified beyond doubt this wasn't production before touching anything: the `mysql` Service (what every app's `DB_HOST=mysql` actually resolves to) selects only pods labeled `app: mysql`, a completely different label than `mysql-longhorn`'s pods carry. No Service existed for `mysql-longhorn` at all — not just unused, structurally unreachable by any application via Kubernetes DNS. With that confirmed, deleted the Deployment and its PVC. All five production apps checked healthy immediately after, no impact.

The same audit also turned up a second orphan — `test-nginx`, a 162-day-old "hello world" deployment with a real Service and Ingress at `nginx.sacenpapier.org`, serving nothing of value. Same pattern: verified it had no dependents, deleted deployment, service, and ingress together.

## Prevention

A storage or infrastructure migration isn't finished when the new thing works — it's finished when the old thing is gone. The June 2nd postmortem should have included a step to decommission the pre-migration instance, not just stand up the replacement. Going forward, any migration postmortem gets an explicit "old resource removed" checkmark before being called closed, not just "new resource healthy."

More generally: today's ArgoCD rollout forced an audit of what's actually managed vs. what's just running, and that audit is what surfaced both orphans. Neither would have been found by normal operation — they were invisible precisely because nothing depended on them. Worth treating "what's running that isn't managed by anything" as a periodic check, not a one-time side effect of an unrelated project.
