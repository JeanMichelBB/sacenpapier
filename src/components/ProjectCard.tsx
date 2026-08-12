import { Project } from "@/data/projects";

type Props = {
  project: Project;
};

const statusLabel = {
  live: { label: "Live", className: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" },
  wip: { label: "WIP", className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20" },
  archived: { label: "Archived", className: "bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border-zinc-500/20" },
};

export function ProjectCard({ project }: Props) {
  const status = statusLabel[project.status];

  return (
    <a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl border border-zinc-200 bg-white p-6 transition-all duration-200 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/60"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <h2 className="text-lg font-semibold text-zinc-900 group-hover:text-zinc-950 dark:text-white dark:group-hover:text-zinc-100">
          {project.name}
        </h2>
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {project.description.en}
      </p>

      <div className="flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          >
            {tag}
          </span>
        ))}
      </div>
    </a>
  );
}
