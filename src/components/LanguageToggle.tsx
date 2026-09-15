"use client";

import { Lang } from "@/lib/strings";

type Props = {
  lang: Lang;
  onChange: (lang: Lang) => void;
};

export function LanguageToggle({ lang, onChange }: Props) {
  return (
    <button
      onClick={() => onChange(lang === "en" ? "fr" : "en")}
      aria-label="Switch language"
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-500 transition-colors hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
    >
      {lang === "en" ? "FR" : "EN"}
    </button>
  );
}
