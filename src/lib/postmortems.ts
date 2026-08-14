import { getAllPosts, getPost, type Post } from "@/lib/posts";

export type Postmortem = Post;

const CONTENT_DIR = "content/postmortems";

export function getAllPostmortems(): Postmortem[] {
  return getAllPosts(CONTENT_DIR);
}

export function getPostmortem(slug: string): Postmortem | undefined {
  return getPost(CONTENT_DIR, slug);
}
