"use client";

import { useCallback, useEffect, useState } from "react";

export function PodBadge() {
  const [pod, setPod] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPod = useCallback(() => {
    setLoading(true);
    fetch(`/api/pod?t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setPod(data.pod))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchPod();
  }, [fetchPod]);

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs text-zinc-500 dark:text-zinc-600">Served by Kubernetes pod</p>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500">
          <span className={`h-1.5 w-1.5 rounded-full ${loading ? "bg-yellow-500 animate-pulse" : "bg-green-500"}`} />
          {pod ?? "—"}
        </span>
        <button
          onClick={fetchPod}
          disabled={loading}
          title="Refresh pod"
          className="rounded-full border border-zinc-200 bg-zinc-50 p-1.5 text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-900 disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500 dark:hover:border-zinc-600 dark:hover:text-zinc-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={loading ? "animate-spin" : ""}
          >
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
        </button>
      </div>
      <p className="text-xs text-zinc-400 dark:text-zinc-700">{"{deployment}-{replicaset-hash}-{pod-hash}"}</p>
    </div>
  );
}
