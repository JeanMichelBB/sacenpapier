---
title: Apercu — Event Management Platform
date: 2026-03-14
duration: a few days
tags: [Apercu, Events, Blog]
---

## What shipped

The core event-organizing surface: an Organizer page for event management, a HostPage covering the hosting process and FAQs, a redesigned Speakers page with search and a hero section, and comments/likes on blog posts — plus the database columns needed to support all of it.

## Why

This is the feature set that turned Apercu from a generic scaffold into an actual event-management product — organizers creating and managing events, speakers with public profiles, and a blog with real engagement, all gated behind admin approval where it matters.

## How it's set up

React frontend, FastAPI backend, admin approval workflow gating what goes public — the same shape documented in Apercu's own architecture notes today.

## What's next

CORS got locked down to a specific origin shortly after this, once the platform had real public-facing surface area worth protecting.
