import type { Post } from "@/lib/posts";

export type PostKind = "postmortems" | "updates";

export type WritingEntry = { post: Post; kind: PostKind };

export function basePathFor(kind: PostKind): "/postmortems" | "/updates" {
  return kind === "postmortems" ? "/postmortems" : "/updates";
}
