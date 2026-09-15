import { Project } from "@/data/projects";
import { Lang } from "@/lib/strings";

type Props = {
  project: Project;
  lang: Lang;
  liveLabel: string;
  sourceLabel: string;
};

const statusLabel = {
  live: { label: "Live", className: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" },
  wip: { label: "WIP", className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20" },
  archived: { label: "Archived", className: "bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border-zinc-500/20" },
};

export function ProjectCard({ project, lang, liveLabel, sourceLabel }: Props) {
  const status = statusLabel[project.status];

  return (
    <div className="group rounded-xl border border-zinc-200 bg-white p-6 transition-all duration-200 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/60">
      <div className="mb-4 flex items-start justify-between gap-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          {project.name}
        </h2>
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {project.description[lang]}
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-4 border-t border-zinc-100 pt-4 text-sm dark:border-zinc-800">
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-zinc-700 transition-colors hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
        >
          {liveLabel}
        </a>
        <a
          href={project.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-zinc-500 transition-colors hover:text-zinc-950 dark:text-zinc-500 dark:hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.4 7.86 10.93.57.1.78-.25.78-.55v-2.16c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.42-2.7 5.4-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .3.21.66.79.55A10.52 10.52 0 0 0 23.5 12c0-6.27-5.23-11.5-11.5-11.5z" />
          </svg>
          {sourceLabel}
        </a>
      </div>
    </div>
  );
}
