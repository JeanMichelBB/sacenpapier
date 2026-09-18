#!/usr/bin/env node
// Flags update tags that recur often enough to deserve a skills.ts button
// but aren't matched by any entry yet — the drift check that would have
// caught `React`/`FastAPI` sitting un-buttoned for two years.
import fs from "fs";
import path from "path";

const THRESHOLD = 2; // a tag needs to show up on this many posts to matter

// Tags that are deliberately never buttons: project names, or tags reviewed
// and judged too one-off / not a real recruiter-facing skill (see the
// sacenpapier-content skill's step 4 for the judgment call each covers).
const IGNORE = new Set(
  [
    // project names
    "x", "BotWhy", "PopRoom", "Apercu", "Homelab",
    // reviewed, not a standalone skill
    "Migration", "Dashboard", "Admin", "Moderation", "Rebrand", "Privacy",
    "Blog", "Events", "Email",
  ].map((t) => t.toLowerCase())
);

const updatesDir = path.join(process.cwd(), "content", "updates");
const skillsFile = path.join(process.cwd(), "src", "data", "skills.ts");

const skillsSrc = fs.readFileSync(skillsFile, "utf-8");
const covered = new Set();
for (const m of skillsSrc.matchAll(/match:\s*\[([^\]]*)\]/g)) {
  for (const t of m[1].matchAll(/"([^"]+)"/g)) covered.add(t[1].toLowerCase());
}

const counts = new Map(); // lowercase tag -> { display, files: Set }
for (const file of fs.readdirSync(updatesDir).filter((f) => f.endsWith(".md"))) {
  const raw = fs.readFileSync(path.join(updatesDir, file), "utf-8");
  const match = raw.match(/^tags:\s*\[(.*)\]/m);
  if (!match) continue;
  const tags = match[1]
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  for (const tag of tags) {
    const key = tag.toLowerCase();
    if (!counts.has(key)) counts.set(key, { display: tag, files: new Set() });
    counts.get(key).files.add(file);
  }
}

const gaps = [];
for (const [key, { display, files }] of counts) {
  if (files.size < THRESHOLD) continue;
  if (IGNORE.has(key)) continue;
  if (covered.has(key)) continue;
  gaps.push({ display, count: files.size, files: [...files] });
}

if (gaps.length === 0) {
  console.log(`✓ No skill gaps — every tag used ${THRESHOLD}+ times is covered by skills.ts or explicitly ignored.`);
  process.exit(0);
}

gaps.sort((a, b) => b.count - a.count);
console.error(`✗ ${gaps.length} tag(s) used ${THRESHOLD}+ times with no matching skills.ts entry:\n`);
for (const g of gaps) {
  console.error(`  "${g.display}" — ${g.count} posts:`);
  for (const f of g.files) console.error(`    content/updates/${f}`);
}
console.error(
  "\nEither add a new skills.ts entry matching this tag, fold it into an existing skill's match array, or add it to IGNORE in scripts/check-skills.mjs if it's deliberately not a button."
);
process.exit(1);
