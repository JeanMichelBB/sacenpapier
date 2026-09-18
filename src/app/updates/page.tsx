import type { Metadata } from "next";
import { getAllUpdates } from "@/lib/updates";
import { PostListPage } from "@/components/PostListPage";

export const metadata: Metadata = {
  title: "Updates",
  description: "Shipped features and changes across sacenpapier.org's projects.",
};

export default async function UpdatesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; skill?: string }>;
}) {
  const { page, skill } = await searchParams;
  const updates = getAllUpdates();
  const currentPage = parseInt(page ?? "1", 10) || 1;

  return (
    <PostListPage titleKey="updates" basePath="/updates" posts={updates} currentPage={currentPage} currentSkill={skill} />
  );
}
