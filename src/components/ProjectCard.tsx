import { Project } from "@/data/projects";
import { getTagLayer, TAG_LAYER_DOT } from "@/lib/tagLayer";

type Props = {
  project: Project;
  selected: boolean;
  onSelect: () => void;
  hideStatus?: boolean;
  liveLabel: string;
  sourceLabel: string;
};

const statusLabel = {
  live: { label: "Live", className: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" },
  wip: { label: "WIP", className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20" },
  archived: { label: "Archived", className: "bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border-zinc-500/20" },
};

export function ProjectCard({ project, selected, onSelect, hideStatus, liveLabel, sourceLabel }: Props) {
  const status = statusLabel[project.status];

  return (
    <div
      className={`w-full rounded-xl border transition-colors ${
        selected
          ? "border-[#FF8225] bg-[#FF8225]/[0.08] dark:bg-[#FF8225]/10"
          : "border-zinc-200 bg-white hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
      }`}
    >
      <button onClick={onSelect} className="w-full p-4 text-left">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="font-semibold text-zinc-900 dark:text-white">{project.name}</span>
          {!hideStatus && (
            <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${status.className}`}>
              {status.label}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {project.tags.map((tag) => {
            const layer = getTagLayer(tag);
            return (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              >
                {layer && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${TAG_LAYER_DOT[layer]}`} />}
                {tag}
              </span>
            );
          })}
        </div>
      </button>
      <div className="flex gap-4 border-t border-zinc-100 px-4 py-2.5 text-xs dark:border-zinc-800/60">
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-white"
        >
          {liveLabel}
        </a>
        <a
          href={project.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-white"
        >
          {sourceLabel}
        </a>
      </div>
    </div>
  );
}
