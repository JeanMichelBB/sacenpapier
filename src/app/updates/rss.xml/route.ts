import { getAllUpdates } from "@/lib/updates";

const BASE = "https://sacenpapier.org";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const updates = getAllUpdates();

  const items = updates
    .map((u) => {
      const url = `${BASE}/updates/${u.slug}`;
      const pubDate = new Date(u.date).toUTCString();
      return `    <item>
      <title>${escapeXml(u.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(u.summary)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>sacenpapier.org — Updates</title>
    <link>${BASE}/updates</link>
    <description>Shipped features and changes across sacenpapier.org's projects.</description>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
