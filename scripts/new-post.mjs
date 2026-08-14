#!/usr/bin/env node
import fs from "fs";
import path from "path";

const [type, ...titleParts] = process.argv.slice(2);
const title = titleParts.join(" ").trim();

if ((type !== "postmortem" && type !== "update") || !title) {
  console.error('Usage: npm run new-postmortem -- "Incident Title"');
  console.error('       npm run new-update -- "Feature Title"');
  process.exit(1);
}

const contentDir = type === "postmortem" ? "postmortems" : "updates";
const sections =
  type === "postmortem"
    ? ["What happened", "Root cause", "Fix", "Prevention"]
    : ["What shipped", "Why", "How it's set up", "What's next"];

const today = new Date().toISOString().slice(0, 10);
const slug = `${today}-${title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/(^-|-$)/g, "")}`;

const dir = path.join(process.cwd(), "content", contentDir);
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

${sections.map((s) => `## ${s}\n`).join("\n")}`;

fs.writeFileSync(file, template);
console.log(`Created ${path.relative(process.cwd(), file)}`);
console.log("Fill in duration, tags, and the sections — it'll show up on the site automatically.");
