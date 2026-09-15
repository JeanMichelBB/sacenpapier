"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { projects, type Role } from "@/data/projects";
import { Postmortem } from "@/lib/postmortems";
import { Update } from "@/lib/updates";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectPreview } from "@/components/ProjectPreview";
import { AboutContent } from "@/components/AboutContent";
import { InfrastructureContent } from "@/components/InfrastructureContent";
import { PostCard } from "@/components/PostCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { GithubLink } from "@/components/GithubLink";
import { LinkedinLink } from "@/components/LinkedinLink";
import { EmailLink } from "@/components/EmailLink";
import { PodBadge } from "@/components/PodBadge";
import { strings, type Lang } from "@/lib/strings";

function NotFoundBanner({ onLoad }: { onLoad: (subdomain: string) => void }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const notfound = searchParams.get("notfound");
    if (notfound) {
      onLoad(notfound);
      router.replace("/");
    }
  }, []);

  return null;
}

export function Hub({ postmortems, updates }: { postmortems: Postmortem[]; updates: Update[] }) {
  const [crushed, setCrushed] = useState(false);
  const [notFound, setNotFound] = useState<string | null>(null);
  const [updatesCount, setUpdatesCount] = useState(1);
  const [postmortemsPage, setPostmortemsPage] = useState(0);
  const [lang, setLang] = useState<Lang>("en");
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const [activeView, setActiveView] = useState<"projects" | "about" | "infrastructure">("projects");
  const [selectedSlug, setSelectedSlug] = useState(projects[0].slug);

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

  const sortedProjects =
    activeRole
      ? [...projects].sort((a, b) => {
          const scoreA = a.focus.indexOf(activeRole);
          const scoreB = b.focus.indexOf(activeRole);
          return (scoreA === -1 ? 99 : scoreA) - (scoreB === -1 ? 99 : scoreB);
        })
      : projects;

  const selectedProject = sortedProjects.find((p) => p.slug === selectedSlug) ?? sortedProjects[0];

  const backendStats = [
    { label: t.backendStatServices, value: projects.filter((p) => p.tags.includes("FastAPI")).length },
    { label: t.backendStatDb, value: projects.filter((p) => p.tags.includes("MySQL")).length },
    {
      label: t.backendStatAuth,
      value: Array.from(new Set(projects.flatMap((p) => p.tags.filter((tag) => ["OAuth", "JWT"].includes(tag))))).length,
    },
    {
      label: t.backendStatIntegrations,
      value: Array.from(new Set(projects.flatMap((p) => p.tags.filter((tag) => ["Stripe", "OpenRouter"].includes(tag))))).length,
    },
  ];

  const pagedUpdates = updates.slice(0, updatesCount);
  const hasMoreUpdates = pagedUpdates.length < updates.length;
  const POSTMORTEMS_PER_PAGE = 4;
  const postmortemsPageCount = Math.ceil(postmortems.length / POSTMORTEMS_PER_PAGE);
  const pagedPostmortems = postmortems.slice(
    postmortemsPage * POSTMORTEMS_PER_PAGE,
    (postmortemsPage + 1) * POSTMORTEMS_PER_PAGE
  );

  const projectsSection = (
    <section>
      <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-zinc-500">
        {t.projects}
      </h2>
      {activeRole === "backend" && (
        <div className="mb-6 grid grid-cols-2 gap-4 rounded-xl border border-zinc-200 bg-white p-5 sm:grid-cols-4 dark:border-zinc-800 dark:bg-zinc-900">
          {backendStats.map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-white">{stat.value}</div>
              <div className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-600">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {activeRole === "frontend" ? (
        <div className="flex flex-col gap-6">
          {sortedProjects.map((project) => (
            <ProjectPreview key={project.slug} project={project} lang={lang} liveLabel={t.live} sourceLabel={t.source} />
          ))}
        </div>
      ) : (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            {sortedProjects.map((project) => (
              <ProjectCard
                key={project.slug}
                project={project}
                selected={project.slug === selectedProject.slug}
                onSelect={() => setSelectedSlug(project.slug)}
              />
            ))}
          </div>
          <ProjectPreview project={selectedProject} lang={lang} liveLabel={t.live} sourceLabel={t.source} />
        </>
      )}

      {activeRole === "backend" && (
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">{t.postmortems}</h3>
            {postmortemsPageCount > 1 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPostmortemsPage((p) => Math.max(0, p - 1))}
                  disabled={postmortemsPage === 0}
                  aria-label="Previous page"
                  className="rounded-full border border-zinc-200 p-1.5 text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-900 disabled:opacity-30 disabled:hover:border-zinc-200 dark:border-zinc-800 dark:text-zinc-500 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <span className="font-mono text-xs text-zinc-400 dark:text-zinc-600 tabular-nums">
                  {postmortemsPage + 1} / {postmortemsPageCount}
                </span>
                <button
                  onClick={() => setPostmortemsPage((p) => Math.min(postmortemsPageCount - 1, p + 1))}
                  disabled={postmortemsPage >= postmortemsPageCount - 1}
                  aria-label="Next page"
                  className="rounded-full border border-zinc-200 p-1.5 text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-900 disabled:opacity-30 disabled:hover:border-zinc-200 dark:border-zinc-800 dark:text-zinc-500 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          <div className="flex min-h-[560px] flex-col gap-3">
            {pagedPostmortems.map((postmortem) => (
              <PostCard key={postmortem.slug} post={postmortem} basePath="/postmortems" />
            ))}
          </div>
        </div>
      )}

      {activeRole === null && (
        <div className="mt-8 flex flex-col gap-4">
          {postmortems[0] && (
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">{t.postmortems}</h3>
              <Link
                href={`/postmortems/${postmortems[0].slug}`}
                className="block rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
              >
                <div className="text-sm font-medium text-zinc-900 dark:text-white">{postmortems[0].title}</div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">{postmortems[0].summary}</p>
              </Link>
              <button
                onClick={() => {
                  setActiveRole("backend");
                  setActiveView("projects");
                }}
                className="mt-2 w-full rounded-lg border border-zinc-200 py-2 text-xs font-medium text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-500 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
              >
                {t.nextPage}
              </button>
            </div>
          )}

          {updates[0] && (
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">{t.updates}</h3>
              <div className="flex flex-col gap-3">
                {pagedUpdates.map((update) => (
                  <PostCard key={update.slug} post={update} basePath="/updates" />
                ))}
              </div>
              {hasMoreUpdates && (
                <button
                  onClick={() => setUpdatesCount((c) => c + 4)}
                  className="mt-2 w-full rounded-lg border border-zinc-200 py-2 text-xs font-medium text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-500 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
                >
                  {t.nextPage}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-white">
      <Suspense>
        <NotFoundBanner onLoad={setNotFound} />
      </Suspense>
      <div className="mx-auto max-w-3xl px-6 py-16">
        {notFound && (
          <div className="mb-6 flex justify-center animate-fade-in">
            <div className="inline-flex items-center gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:border-red-700 dark:bg-red-950 dark:text-red-300">
              <span>✕</span>
              <span><span className="text-red-500 dark:text-red-400">{notFound}.sacenpapier.org</span> {t.notFoundSuffix}</span>
            </div>
          </div>
        )}
        {/* Header */}
        <header className="mb-12 flex items-start justify-between gap-4">
          <div>
            <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold tracking-tight">
              sacenpapier.org
              <button onClick={() => setCrushed(true)} className="hidden sm:inline-flex shrink-0 transition-transform duration-150 hover:scale-110 active:scale-95">
                <Image
                  src={crushed ? "/img/Paper Bag Crush.png" : "/img/shopping-bag.png"}
                  alt="sacenpapier logo"
                  width={36}
                  height={36}
                  className="rounded-md"
                />
              </button>
            </h1>
            <p className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
              {t.tagline}
              <button onClick={() => setCrushed(true)} className="sm:hidden shrink-0 transition-transform duration-150 hover:scale-110 active:scale-95">
                <Image
                  src={crushed ? "/img/Paper Bag Crush.png" : "/img/shopping-bag.png"}
                  alt="sacenpapier logo"
                  width={28}
                  height={28}
                  className="rounded-md"
                />
              </button>
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <GithubLink />
              <LinkedinLink />
              <EmailLink />
              <LanguageToggle lang={lang} onChange={changeLang} />
              <ThemeToggle />
            </div>
            <p className="max-w-[180px] text-right text-xs leading-snug text-zinc-500 dark:text-zinc-600 sm:max-w-[220px]">
              {t.status}
            </p>
          </div>
        </header>

        {/* Role toggle + page nav */}
        <div className="mb-8 flex flex-wrap items-center gap-2">
          {(
            [
              [null, t.roleFullStack],
              ["frontend", t.roleFrontend],
              ["backend", t.roleBackend],
            ] as const
          ).map(([value, label]) => (
            <button
              key={label}
              onClick={() => {
                const alreadyActive = activeView === "projects" && activeRole === value;
                setActiveRole(alreadyActive ? null : value);
                setActiveView("projects");
              }}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                activeView === "projects" && activeRole === value
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-200 dark:bg-zinc-200 dark:text-zinc-900"
                  : "border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-500 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
              }`}
            >
              {label}
            </button>
          ))}
          <span className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
          <button
            onClick={() => setActiveView(activeView === "infrastructure" ? "projects" : "infrastructure")}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              activeView === "infrastructure"
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-200 dark:bg-zinc-200 dark:text-zinc-900"
                : "border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-500 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
            }`}
          >
            {t.infrastructure}
          </button>
          <button
            onClick={() => setActiveView(activeView === "about" ? "projects" : "about")}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              activeView === "about"
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-200 dark:bg-zinc-200 dark:text-zinc-900"
                : "border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-500 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
            }`}
          >
            {t.aboutNav}
          </button>
        </div>

        <div className="flex flex-col gap-12">
          {activeView === "about" ? (
            <AboutContent lang={lang} />
          ) : activeView === "infrastructure" ? (
            <InfrastructureContent lang={lang} />
          ) : (
            projectsSection
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 flex flex-col items-center gap-3 text-xs text-zinc-500 dark:text-zinc-600">
          <PodBadge />
          <div className="flex items-center gap-3">
            <a href="mailto:jeanmichelbberube@gmail.com" className="hover:text-zinc-900 dark:hover:text-zinc-200">
              jeanmichelbberube@gmail.com
            </a>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <a
              href="https://www.linkedin.com/in/jeanmichelbb/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-900 dark:hover:text-zinc-200"
            >
              LinkedIn
            </a>
          </div>
          {t.footer}
        </footer>
      </div>
    </div>
  );
}
