---
title: Apercu — Migrating from Create React App to Vite
date: 2024-09-04
duration: one day
tags: [Apercu, Vite, Migration]
---

## What shipped

Moved Apercu's frontend off Create React App onto Vite, and renamed the project from a generic working title to Aperçu.

## Why

CRA's dev server and build times were the bottleneck for iteration speed on a project still actively taking shape. Vite's dev server starts near-instantly and its build is meaningfully faster, which matters more the longer a project stays in active development.

## How it's set up

Straight swap of the build tooling — same React code, new bundler underneath. This is also roughly when the project took its current name and identity, moving from "just the working app" to Aperçu specifically.

## What's next

Everything built on top of Apercu since — the event management platform, blog engagement features, admin auth — has run on this Vite setup without needing to revisit the tooling choice.
