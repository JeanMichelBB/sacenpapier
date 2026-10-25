import { getAllPostmortems } from "@/lib/postmortems";
import { getAllUpdates } from "@/lib/updates";
import type { WritingEntry } from "@/lib/writing";

/** Postmortems + Updates merged into one date-sorted list — they share the
 * same Post format (src/lib/posts.ts), so there's no real reason to keep
 * them as two separate browsing surfaces even though they stay in separate
 * content/ folders. Server-only: reads the filesystem via src/lib/posts.ts. */
export function getAllWriting(): WritingEntry[] {
  return [
    ...getAllPostmortems().map((post) => ({ post, kind: "postmortems" as const })),
    ...getAllUpdates().map((post) => ({ post, kind: "updates" as const })),
  ].sort((a, b) => (a.post.date < b.post.date ? 1 : -1));
}
