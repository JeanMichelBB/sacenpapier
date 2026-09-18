---
title: Apercu — Building the Core App
date: 2024-06-04
duration: about 7 months, real work over 6 weeks
tags: [Apercu, React, FastAPI]
---

## What shipped

The actual foundation of Apercu: a full rebuild in April 2024 from an earlier Create React App prototype onto Docker + React + FastAPI + MySQL, with a contact form that sends real email, an admin "agent" interface for managing the underlying data, password hashing, and a first (later superseded) forget-password flow.

## Why

The project started as a bare CRA scaffold in late 2023 — a couple of early style passes, nothing functional behind it. The April "Refoundation" commit is where Apercu became a real full-stack app: a backend worth calling FastAPI, a database worth calling MySQL, and the first feature that actually did something end-to-end (a contact form that delivers a real email).

## How it's set up

`docker-compose.yml` brought up React, FastAPI, and MySQL together from this point on — the same three-service shape the app still runs today. The "agent interface" gave whoever ran the site a database-backed admin view rather than needing direct SQL access. Auth started bare (plaintext-adjacent) and was hardened within the same two weeks: passwords hashed, then a first forgot-password page wired to the same email-sending path the contact form had just proven out.

## What's next

That early forget-password flow was a first pass, not the final one — it got properly rebuilt with a real reset-link email flow in October 2024, [written up separately](/updates/2024-10-17-apercu-password-reset).
