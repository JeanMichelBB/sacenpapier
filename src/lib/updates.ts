import { getAllPosts, getPost, type Post } from "@/lib/posts";

export type Update = Post;

const CONTENT_DIR = "content/updates";

export function getAllUpdates(): Update[] {
  return getAllPosts(CONTENT_DIR);
}

export function getUpdate(slug: string): Update | undefined {
  return getPost(CONTENT_DIR, slug);
}
