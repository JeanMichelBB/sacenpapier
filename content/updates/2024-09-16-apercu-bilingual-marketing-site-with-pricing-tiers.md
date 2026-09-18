---
title: Apercu — Bilingual Marketing Site with Pricing Tiers
date: 2024-09-16
duration: 4 days
tags: [Apercu, i18n, React]
---

## What shipped

A separate marketing front, `first-look`, sitting alongside the main app: a Service section, a Pricing section, and three service tiers (Basic, Intermediate, Advanced) each with their own page — all fully bilingual via `react-i18next`, with complete English and French translation files.

## Why

This landed right after the Vite migration, when Apercu got its real name — the app itself demonstrates the product, but a prospective client landing on the site cold needs a pitch: what the service actually costs and what each tier includes, in the language they land in.

## How it's set up

`first-look` is its own React app rather than a route bolted onto the main one. Content in every tier page — descriptions, feature lists, even separate copy for the desktop and mobile layouts of the same section — is pulled through `useTranslation()` keys rather than hardcoded strings, backed by parallel `en`/`fr` JSON translation files kept in lockstep. The tier pages share a consistent shape (intro copy, two images, a features list) so adding or editing a plan means touching the translation file, not the component.

## What's next

The main app's Vite migration and rename to Aperçu had just landed days earlier — this marketing site is what actually put the new name in front of visitors for the first time.
