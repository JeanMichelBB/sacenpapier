"use client";

import { SiteHeader } from "@/components/SiteHeader";
import { HomelabDocsContent } from "@/components/HomelabDocsContent";
import { strings } from "@/lib/strings";
import { useLang } from "@/lib/useLang";

export function DocumentationPageClient() {
  const { lang, changeLang } = useLang();
  const t = strings[lang];

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <SiteHeader variant="sub" title={t.homelabDocsNav} lang={lang} onChangeLang={changeLang} />

        <main>
          <HomelabDocsContent />
        </main>
      </div>
    </div>
  );
}
