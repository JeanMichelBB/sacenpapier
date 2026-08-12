"use client";

import { useEffect, useState } from "react";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("cookie-consent") !== "accepted") {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4 animate-fade-in">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-200 bg-white/95 px-4 py-3 text-xs text-zinc-600 shadow-lg backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95 dark:text-zinc-400">
        <span>
          This site uses <code className="rounded bg-zinc-100 px-1 py-0.5 text-[11px] dark:bg-zinc-800">localStorage</code> to remember your theme preference. No tracking, no third-party cookies.
        </span>
        <button
          onClick={accept}
          className="shrink-0 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
