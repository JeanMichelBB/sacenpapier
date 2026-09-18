import type { Metadata } from "next";
import { getAllPostmortems } from "@/lib/postmortems";
import { PostListPage } from "@/components/PostListPage";

export const metadata: Metadata = {
  title: "Postmortems",
  description: "Incident writeups — what happened, root cause, fix, and prevention.",
};

export default async function PostmortemsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const postmortems = getAllPostmortems();
  const currentPage = parseInt(page ?? "1", 10) || 1;

  return <PostListPage titleKey="postmortems" basePath="/postmortems" posts={postmortems} currentPage={currentPage} />;
}
