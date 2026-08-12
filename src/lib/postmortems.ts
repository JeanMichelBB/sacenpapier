import fs from "fs";
import path from "path";

export type Postmortem = {
  slug: string;
  title: string;
  date: string;
  duration: string;
  tags: string[];
  summary: string;
  sections: { label: string; body: string }[];
};

const CONTENT_DIR = path.join(process.cwd(), "content/postmortems");

function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error("Postmortem markdown is missing frontmatter (--- ... ---)");
  const [, frontmatter, body] = match;
  const data: Record<string, string> = {};
  for (const line of frontmatter.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    data[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return { data, body };
}

function parseSections(body: string): { label: string; body: string }[] {
  return body
    .trim()
    .split(/\n(?=## )/)
    .map((chunk) => {
      const match = chunk.match(/^##\s+(.+)\n([\s\S]*)$/);
      if (!match) return null;
      return { label: match[1].trim(), body: match[2].trim() };
    })
    .filter((s): s is { label: string; body: string } => s !== null);
}

function parseTags(raw: string): string[] {
  return raw
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function getAllPostmortems(): Postmortem[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");
      const { data, body } = parseFrontmatter(raw);
      const sections = parseSections(body);
      return {
        slug,
        title: data.title ?? slug,
        date: data.date ?? "",
        duration: data.duration ?? "",
        tags: parseTags(data.tags ?? ""),
        summary: sections[0]?.body ?? "",
        sections,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostmortem(slug: string): Postmortem | undefined {
  return getAllPostmortems().find((p) => p.slug === slug);
}
