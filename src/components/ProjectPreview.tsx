"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

export function ProjectPreview({ project, lang, liveLabel, sourceLabel }: Props) {
  const status = statusLabel[project.status];

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="px-4 pt-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-lg font-semibold text-zinc-900 dark:text-white">{project.name}</span>
          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${status.className}`}>
            {status.label}
          </span>
        </div>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-y border-zinc-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="flex gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
            </span>
            <span className="ml-1.5 font-mono text-xs text-zinc-400 dark:text-zinc-600">{project.url.replace("https://", "")}</span>
          </div>
          <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">{project.description[lang]}</p>
        </div>
        <div className="flex shrink-0 items-center gap-4 text-sm">
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
      <ScaledFrame src={project.url} title={project.name} />
    </div>
  );
}

const DESKTOP_REF = { w: 1280, h: 720 };
const MOBILE_REF = { w: 390, h: 693 };

function ScaledFrame({ src, title }: { src: string; title: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [ref, setRef] = useState(DESKTOP_REF);
  // Cache-bust so visitors always see the currently-deployed app instead of a
  // browser-cached snapshot from a previous visit — memoized per src so it
  // doesn't force a reload on every re-render (dark mode, lang toggle, etc).
  const bustedSrc = useMemo(() => `${src}${src.includes("?") ? "&" : "?"}_t=${Date.now()}`, [src]);

  useEffect(() => {
    function update() {
      const isDesktop = window.matchMedia("(min-width: 640px)").matches;
      const next = isDesktop ? DESKTOP_REF : MOBILE_REF;
      setRef(next);
      if (containerRef.current) {
        setScale(containerRef.current.clientWidth / next.w);
      }
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative aspect-[9/16] overflow-hidden bg-zinc-50 sm:aspect-video dark:bg-zinc-950"
    >
      <iframe
        key={src}
        src={bustedSrc}
        title={title}
        style={{
          width: ref.w,
          height: ref.h,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          border: "none",
        }}
      />
    </div>
  );
}
