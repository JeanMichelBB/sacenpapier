import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllUpdates, getUpdate } from "@/lib/updates";
import { BackLink } from "@/components/BackLink";

export function generateStaticParams() {
  return getAllUpdates().map((p) => ({ slug: p.slug }));
}

export default async function UpdatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const update = getUpdate(slug);
  if (!update) notFound();

  const related = getAllUpdates()
    .filter((p) => p.slug !== update.slug)
    .map((p) => ({
      post: p,
      shared: p.tags.filter((tag) => update.tags.includes(tag)).length,
    }))
    .sort((a, b) => b.shared - a.shared || (a.post.date < b.post.date ? 1 : -1))
    .slice(0, 3)
    .map((r) => r.post);

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-white">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <BackLink />

        <header className="mt-8 mb-10">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-600">
            <span>{update.date}</span>
            <span className="text-zinc-400 dark:text-zinc-700">·</span>
            <span>{update.duration}</span>
          </div>
          <h1 className="mb-4 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            {update.title}
          </h1>
          <div className="flex flex-wrap gap-2">
            {update.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        <div className="flex flex-col gap-8">
          {update.sections.map((section) => (
            <section key={section.label}>
              <h2 className="mb-2 text-xs font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-600">
                {section.label}
              </h2>
              <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{section.body}</p>
            </section>
          ))}
        </div>

        {related.length > 0 && (
          <section className="mt-16 border-t border-zinc-200 pt-8 dark:border-zinc-900">
            <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-600">
              More updates
            </h2>
            <div className="flex flex-col gap-3">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/updates/${p.slug}`}
                  className="block text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  {p.title}
                  <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-600">{p.date}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
