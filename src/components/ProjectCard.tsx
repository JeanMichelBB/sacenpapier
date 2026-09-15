import { Project } from "@/data/projects";

type Props = {
  project: Project;
  selected: boolean;
  onSelect: () => void;
  hideStatus?: boolean;
};

const statusLabel = {
  live: { label: "Live", className: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" },
  wip: { label: "WIP", className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20" },
  archived: { label: "Archived", className: "bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border-zinc-500/20" },
};

export function ProjectCard({ project, selected, onSelect, hideStatus }: Props) {
  const status = statusLabel[project.status];

  return (
    <button
      onClick={onSelect}
      className={`w-full rounded-xl border p-4 text-left transition-colors ${
        selected
          ? "border-zinc-900 bg-zinc-50 dark:border-zinc-200 dark:bg-zinc-800/60"
          : "border-zinc-200 bg-white hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="font-semibold text-zinc-900 dark:text-white">{project.name}</span>
        {!hideStatus && (
          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${status.className}`}>
            {status.label}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          >
            {tag}
          </span>
        ))}
      </div>
    </button>
  );
}
