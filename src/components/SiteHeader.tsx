"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { GithubLink } from "@/components/GithubLink";
import { LinkedinLink } from "@/components/LinkedinLink";
import { EmailLink } from "@/components/EmailLink";
import { BackLink } from "@/components/BackLink";
import { strings, type Lang } from "@/lib/strings";

type BaseProps = {
  lang: Lang;
  onChangeLang: (lang: Lang) => void;
};

type Props =
  | (BaseProps & { variant: "home" })
  | (BaseProps & { variant: "sub"; title?: string; titleBadge?: boolean; backBehavior?: "home" | "history" });

function HeaderActions({ lang, onChangeLang }: BaseProps) {
  return (
    <div className="flex items-center gap-2 sm:shrink-0">
      <GithubLink />
      <LinkedinLink />
      <EmailLink />
      <LanguageToggle lang={lang} onChange={onChangeLang} />
      <ThemeToggle />
    </div>
  );
}

export function SiteHeader(props: Props) {
  const t = strings[props.lang];
  const [crushed, setCrushed] = useState(false);

  if (props.variant === "sub") {
    return (
      <header className="mb-12 flex items-start justify-between gap-4">
        <div>
          {props.backBehavior === "history" ? (
            <BackLink label={t.backHome} />
          ) : (
            <Link
              href="/"
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-200"
            >
              {t.backHome}
            </Link>
          )}
          {props.title && (
            <h1 className="mt-2 flex items-center gap-3 text-3xl font-medium">
              {props.title}
              {props.titleBadge && (
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
                </span>
              )}
            </h1>
          )}
        </div>
        <HeaderActions lang={props.lang} onChangeLang={props.onChangeLang} />
      </header>
    );
  }

  return (
    <header className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="mb-2 flex items-center gap-3 text-3xl font-medium">
          sacenpapier.org
          <button
            onClick={() => setCrushed(true)}
            aria-label="sacenpapier easter egg"
            className="shrink-0 transition-transform duration-150 active:scale-[0.97]"
          >
            <Image
              src={crushed ? "/img/Paper Bag Crush.png" : "/img/shopping-bag.png"}
              alt=""
              width={32}
              height={32}
              className="rounded-md"
            />
          </button>
        </h1>
        <p className="max-w-md text-zinc-600 dark:text-zinc-400">{t.tagline}</p>
      </div>
      <HeaderActions lang={props.lang} onChangeLang={props.onChangeLang} />
    </header>
  );
}
