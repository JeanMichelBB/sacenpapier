#!/usr/bin/env node
import fs from "fs";
import path from "path";

const title = process.argv.slice(2).join(" ").trim();
if (!title) {
  console.error('Usage: npm run new-postmortem -- "Incident Title"');
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const slug = `${today}-${title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/(^-|-$)/g, "")}`;

const dir = path.join(process.cwd(), "content/postmortems");
fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, `${slug}.md`);

if (fs.existsSync(file)) {
  console.error(`Already exists: ${path.relative(process.cwd(), file)}`);
  process.exit(1);
}

const template = `---
title: ${title}
date: ${today}
duration:
tags: [ ]
---

## What happened

## Root cause

## Fix

## Prevention
`;

fs.writeFileSync(file, template);
console.log(`Created ${path.relative(process.cwd(), file)}`);
console.log("Fill in duration, tags, and the four sections — it'll show up on the site automatically.");
