"use client";

import { SiteHeader } from "@/components/SiteHeader";
import { InfrastructureContent } from "@/components/InfrastructureContent";
import { strings } from "@/lib/strings";
import { useLang } from "@/lib/useLang";

export function InfrastructurePageClient() {
  const { lang, changeLang } = useLang();
  const t = strings[lang];

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <SiteHeader variant="sub" title={t.infrastructure} titleBadge lang={lang} onChangeLang={changeLang} />

        <main>
          <InfrastructureContent lang={lang} />
        </main>
      </div>
    </div>
  );
}
