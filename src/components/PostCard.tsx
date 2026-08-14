import Link from "next/link";
import { Post } from "@/lib/posts";

type Props = {
  post: Post;
  basePath: string;
};

export function PostCard({ post, basePath }: Props) {
  return (
    <div className="border-l border-zinc-200 pl-4 py-1 dark:border-zinc-800">
      <div className="mb-1.5 flex items-baseline justify-between gap-4">
        <Link
          href={`${basePath}/${post.slug}`}
          className="text-sm font-medium text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-100"
        >
          {post.title}
        </Link>
        <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-600">{post.duration}</span>
      </div>

      <p className="mb-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-500">{post.summary}</p>

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500 dark:text-zinc-600">
        {post.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
        <span className="text-zinc-400 dark:text-zinc-700">·</span>
        <span>{post.date}</span>
      </div>
    </div>
  );
}
