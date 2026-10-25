import type { MetadataRoute } from "next";
import { getAllPostmortems } from "@/lib/postmortems";
import { getAllUpdates } from "@/lib/updates";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://sacenpapier.org";

  const postmortemEntries = getAllPostmortems().map((p) => ({
    url: `${base}/postmortems/${p.slug}`,
    lastModified: p.date,
  }));

  const updateEntries = getAllUpdates().map((u) => ({
    url: `${base}/updates/${u.slug}`,
    lastModified: u.date,
  }));

  return [
    { url: base, changeFrequency: "weekly" as const },
    { url: `${base}/about`, changeFrequency: "monthly" as const },
    { url: `${base}/infrastructure`, changeFrequency: "daily" as const },
    { url: `${base}/documentation`, changeFrequency: "monthly" as const },
    ...postmortemEntries,
    ...updateEntries,
  ];
}
