"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { GithubLink } from "@/components/GithubLink";
import { LinkedinLink } from "@/components/LinkedinLink";
import { EmailLink } from "@/components/EmailLink";
import { strings, type Lang } from "@/lib/strings";

export default function AboutPage() {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved === "en" || saved === "fr") {
      setLang(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  function changeLang(next: Lang) {
    localStorage.setItem("lang", next);
    document.documentElement.lang = next;
    setLang(next);
  }

  const t = strings[lang];

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-12 flex items-start justify-between gap-4">
          <div>
            <Link
              href="/"
              className="mb-2 inline-block text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-200"
            >
              {t.backHome}
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">{t.aboutTitle}</h1>
          </div>
          <div className="flex items-center gap-2">
            <GithubLink />
            <LinkedinLink />
            <EmailLink />
            <LanguageToggle lang={lang} onChange={changeLang} />
            <ThemeToggle />
          </div>
        </header>

        <div className="flex flex-col gap-4">
          {t.aboutText.map((paragraph, i) => (
            <p key={i} className="text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
