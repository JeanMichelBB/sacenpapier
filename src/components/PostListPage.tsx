"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { PostCard } from "@/components/PostCard";
import { strings } from "@/lib/strings";
import { useLang } from "@/lib/useLang";
import { Post } from "@/lib/posts";
import { skills as skillList } from "@/data/skills";

const PER_PAGE = 10;

type Props = {
  titleKey: "postmortems" | "updates";
  basePath: "/postmortems" | "/updates";
  posts: Post[];
  currentPage: number;
  /** Selected skill label (Updates only) — filters posts before pagination. */
  currentSkill?: string;
};

export function PostListPage({ titleKey, basePath, posts, currentPage, currentSkill }: Props) {
  const { lang, changeLang } = useLang();
  const t = strings[lang];
  const showSkillFilter = basePath === "/updates";
  const activeSkill = showSkillFilter ? skillList.find((s) => s.label === currentSkill) : undefined;

  const filteredPosts = activeSkill
    ? posts.filter((post) =>
        post.tags.some((tag) => activeSkill.match.some((m) => m.toLowerCase() === tag.toLowerCase()))
      )
    : posts;

  const pageCount = Math.max(1, Math.ceil(filteredPosts.length / PER_PAGE));
  const safePage = Math.min(Math.max(1, currentPage), pageCount);
  const paged = filteredPosts.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  function pageHref(page: number) {
    const params = new URLSearchParams();
    if (activeSkill) params.set("skill", activeSkill.label);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <SiteHeader variant="sub" title={t[titleKey]} lang={lang} onChangeLang={changeLang} />

        <main>
        {showSkillFilter && (
          <div className="mb-8 flex flex-wrap gap-2">
            <Link
              href="/updates"
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                !activeSkill
                  ? "border-[#FF8225] bg-[#FF8225] text-zinc-950"
                  : "border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-500 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
              }`}
            >
              {t.allSkills}
            </Link>
            {skillList.map((skill) => (
              <Link
                key={skill.label}
                href={`/updates?skill=${encodeURIComponent(skill.label)}`}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  activeSkill?.label === skill.label
                    ? "border-[#FF8225] bg-[#FF8225] text-zinc-950"
                    : "border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-500 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
                }`}
              >
                {skill.label}
              </Link>
            ))}
          </div>
        )}

        {paged.length > 0 ? (
          <div className="flex flex-col gap-5">
            {paged.map((post) => (
              <PostCard key={post.slug} post={post} basePath={basePath} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-500">{t.noSkillMatches}</p>
        )}

        {pageCount > 1 && (
          <nav className="mt-10 flex items-center justify-center gap-4 text-sm">
            {safePage > 1 ? (
              <Link
                href={pageHref(safePage - 1)}
                className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-500 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
              >
                ← {t.prevPage}
              </Link>
            ) : (
              <span className="rounded-full border border-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-300 dark:border-zinc-900 dark:text-zinc-700">
                ← {t.prevPage}
              </span>
            )}
            <span className="font-mono text-xs tabular-nums text-zinc-400 dark:text-zinc-600">
              {safePage} / {pageCount}
            </span>
            {safePage < pageCount ? (
              <Link
                href={pageHref(safePage + 1)}
                className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-500 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
              >
                {t.nextPageArrow} →
              </Link>
            ) : (
              <span className="rounded-full border border-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-300 dark:border-zinc-900 dark:text-zinc-700">
                {t.nextPageArrow} →
              </span>
            )}
          </nav>
        )}
        </main>
      </div>
    </div>
  );
}
