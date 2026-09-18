import Link from "next/link";
import { strings, type Lang } from "@/lib/strings";
import { projects } from "@/data/projects";
import { skills } from "@/data/skills";

export function AboutContent({ lang }: { lang: Lang }) {
  const t = strings[lang];
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-zinc-500 dark:text-zinc-500">{t.status}</p>

      {t.aboutText.map((paragraph, i) => (
        <p key={i} className="text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
          {paragraph}
        </p>
      ))}

      <div className="mt-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
          {t.aboutProjectsTitle}
        </h2>
        <div className="flex flex-col gap-3">
          {projects.map((project) => (
            <a
              key={project.slug}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
            >
              <div className="mb-1 flex items-center justify-between gap-3">
                <span className="font-semibold text-zinc-900 dark:text-white">{project.name}</span>
                <span className="shrink-0 text-xs font-medium text-zinc-500 dark:text-zinc-500">{t.live}</span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{project.description[lang]}</p>
            </a>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">{t.aboutStackTitle}</h2>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Link
              key={skill.label}
              href={`/updates?skill=${encodeURIComponent(skill.label)}`}
              className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-500 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
            >
              {skill.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
