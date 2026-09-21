"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { projects } from "@/data/projects";
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
import { skills as skillList } from "@/data/skills";

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
  const [postmortemsPage, setPostmortemsPage] = useState(0);
  const [updatesPage, setUpdatesPage] = useState(0);
  const [docSkillFilter, setDocSkillFilter] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>("en");
  const [activeView, setActiveView] = useState<"projects" | "about" | "infrastructure" | "postmortems" | "documentation">("projects");
  const [selectedSlug, setSelectedSlug] = useState(projects[0].slug);
  const [backendPing, setBackendPing] = useState<{ name: string; ms: number | null; ok: boolean }[] | null>(null);
  const [pingTick, setPingTick] = useState(0);
  const [pinging, setPinging] = useState(true);
  const didInit = useRef(false);

  // Take manual control of scroll restoration — otherwise Next.js's own history
  // scroll handling fights with (and wins over) our restoration below.
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // Restore tab + page from the URL, and scroll position from sessionStorage — so
  // browser back (and BackLink's router.back()) lands where you actually were.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab === "infrastructure" || tab === "about" || tab === "postmortems" || tab === "documentation") {
      setActiveView(tab);
    }
    const pm = params.get("pm");
    if (pm) setPostmortemsPage(Math.max(0, parseInt(pm, 10) - 1));
    const up = params.get("up");
    if (up) setUpdatesPage(Math.max(0, parseInt(up, 10) - 1));
    const sk = params.get("sk");
    if (sk && skillList.some((s) => s.label === sk)) setSelectedSkill(sk);
    didInit.current = true;

    const savedScroll = sessionStorage.getItem("hub-scroll");
    if (savedScroll) {
      const y = parseInt(savedScroll, 10);
      // Retried over a longer window on top of the initial fast attempts: on
      // mobile, slower hydration and the live project-preview iframes loading
      // over the network keep changing the page's height well past 300ms, so
      // a short window restores to a y that the page hasn't grown into yet.
      // Bails out if the visitor starts scrolling themselves.
      let cancelled = false;
      const stop = () => {
        cancelled = true;
      };
      window.addEventListener("wheel", stop, { once: true, passive: true });
      window.addEventListener("touchmove", stop, { once: true, passive: true });
      const delays = [0, 50, 150, 300, 600, 1000, 1600, 2400];
      const timers = delays.map((ms) =>
        setTimeout(() => {
          if (!cancelled) window.scrollTo(0, y);
        }, ms)
      );
      return () => {
        timers.forEach(clearTimeout);
        window.removeEventListener("wheel", stop);
        window.removeEventListener("touchmove", stop);
      };
    }
  }, []);

  // Track scroll continuously rather than saving on unmount — Next.js resets
  // scroll to top as part of navigating away, before an unmount cleanup would run,
  // so an unmount-based save would only ever capture 0.
  useEffect(() => {
    function onScroll() {
      sessionStorage.setItem("hub-scroll", String(window.scrollY));
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Keep the URL in sync with tab/page state via replaceState (no extra history
  // entries), so whatever URL is current when you click away is what back restores.
  useEffect(() => {
    if (!didInit.current) return;
    const params = new URLSearchParams();
    if (activeView !== "projects") params.set("tab", activeView);
    if (postmortemsPage > 0) params.set("pm", String(postmortemsPage + 1));
    if (updatesPage > 0) params.set("up", String(updatesPage + 1));
    if (selectedSkill) params.set("sk", selectedSkill);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `/?${qs}` : "/");
  }, [activeView, postmortemsPage, updatesPage, selectedSkill]);

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

  useEffect(() => {
    let cancelled = false;
    function poll() {
      setPinging(true);
      const start = Date.now();
      fetch("/api/backend-latency")
        .then((r) => r.json())
        .then((d) => {
          if (cancelled) return;
          setBackendPing(d.apps);
          setPingTick((t) => t + 1);
        })
        .catch(() => {})
        .finally(() => {
          const remaining = 1000 - (Date.now() - start);
          setTimeout(() => {
            if (!cancelled) setPinging(false);
          }, Math.max(0, remaining));
        });
    }
    poll();
    const interval = setInterval(poll, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const t = strings[lang];

  const selectedProject = projects.find((p) => p.slug === selectedSlug) ?? projects[0];

  const activeSkill = selectedSkill ? skillList.find((s) => s.label === selectedSkill) : undefined;
  const matchesSkill = (tags: string[]) =>
    !!activeSkill && tags.some((tag) => activeSkill.match.some((m) => m.toLowerCase() === tag.toLowerCase()));
  const matchingProjects = activeSkill ? projects.filter((p) => matchesSkill(p.tags)) : [];
  const matchingUpdates = activeSkill ? updates.filter((u) => matchesSkill(u.tags)) : [];
  const matchingPostmortems = activeSkill ? postmortems.filter((p) => matchesSkill(p.tags)) : [];
  const POSTMORTEMS_PER_PAGE = 6;
  const postmortemsPageCount = Math.ceil(postmortems.length / POSTMORTEMS_PER_PAGE);
  const pagedPostmortems = postmortems.slice(
    postmortemsPage * POSTMORTEMS_PER_PAGE,
    (postmortemsPage + 1) * POSTMORTEMS_PER_PAGE
  );
  const activeDocSkill = docSkillFilter ? skillList.find((s) => s.label === docSkillFilter) : undefined;
  const filteredUpdates = activeDocSkill
    ? updates.filter((u) => u.tags.some((tag) => activeDocSkill.match.some((m) => m.toLowerCase() === tag.toLowerCase())))
    : updates;
  const UPDATES_PER_PAGE = 6;
  const updatesPageCount = Math.max(1, Math.ceil(filteredUpdates.length / UPDATES_PER_PAGE));
  const pagedUpdates = filteredUpdates.slice(updatesPage * UPDATES_PER_PAGE, (updatesPage + 1) * UPDATES_PER_PAGE);

  const postmortemsSection = (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">{t.postmortems}</h2>
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
      <div className="flex flex-col gap-3">
        {pagedPostmortems.map((postmortem) => (
          <PostCard key={postmortem.slug} post={postmortem} basePath="/postmortems" />
        ))}
      </div>
      {postmortemsPageCount > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => {
              setPostmortemsPage((p) => Math.max(0, p - 1));
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
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
            onClick={() => {
              setPostmortemsPage((p) => Math.min(postmortemsPageCount - 1, p + 1));
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
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
    </section>
  );

  const documentationSection = (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">{t.documentationNav}</h2>
        {updatesPageCount > 1 && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setUpdatesPage((p) => Math.max(0, p - 1))}
              disabled={updatesPage === 0}
              aria-label="Previous page"
              className="rounded-full border border-zinc-200 p-1.5 text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-900 disabled:opacity-30 disabled:hover:border-zinc-200 dark:border-zinc-800 dark:text-zinc-500 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <span className="font-mono text-xs text-zinc-400 dark:text-zinc-600 tabular-nums">
              {updatesPage + 1} / {updatesPageCount}
            </span>
            <button
              onClick={() => setUpdatesPage((p) => Math.min(updatesPageCount - 1, p + 1))}
              disabled={updatesPage >= updatesPageCount - 1}
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
      <div className="mb-4 flex flex-wrap gap-1.5">
        <button
          onClick={() => {
            setDocSkillFilter(null);
            setUpdatesPage(0);
          }}
          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
            !docSkillFilter
              ? "border-[#FF8225] bg-[#FF8225] text-zinc-950"
              : "border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-500 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
          }`}
        >
          {t.allSkills}
        </button>
        {skillList.map((skill) => (
          <button
            key={skill.label}
            onClick={() => {
              setDocSkillFilter(docSkillFilter === skill.label ? null : skill.label);
              setUpdatesPage(0);
            }}
            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
              docSkillFilter === skill.label
                ? "border-[#FF8225] bg-[#FF8225] text-zinc-950"
                : "border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-500 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
            }`}
          >
            {skill.label}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {pagedUpdates.length > 0 ? (
          pagedUpdates.map((update) => <PostCard key={update.slug} post={update} basePath="/updates" />)
        ) : (
          <p className="text-xs text-zinc-500 dark:text-zinc-500">{t.noSkillMatches}</p>
        )}
      </div>
      {updatesPageCount > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => {
              setUpdatesPage((p) => Math.max(0, p - 1));
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            disabled={updatesPage === 0}
            aria-label="Previous page"
            className="rounded-full border border-zinc-200 p-1.5 text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-900 disabled:opacity-30 disabled:hover:border-zinc-200 dark:border-zinc-800 dark:text-zinc-500 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <span className="font-mono text-xs text-zinc-400 dark:text-zinc-600 tabular-nums">
            {updatesPage + 1} / {updatesPageCount}
          </span>
          <button
            onClick={() => {
              setUpdatesPage((p) => Math.min(updatesPageCount - 1, p + 1));
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            disabled={updatesPage >= updatesPageCount - 1}
            aria-label="Next page"
            className="rounded-full border border-zinc-200 p-1.5 text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-900 disabled:opacity-30 disabled:hover:border-zinc-200 dark:border-zinc-800 dark:text-zinc-500 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      )}
    </section>
  );

  const projectsSection = (
    <section>
      <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-zinc-500">
        {t.projects}
      </h2>
      <p className="mb-3 text-xs text-zinc-400 dark:text-zinc-600">{t.projectPreviewHint}</p>
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard
            key={project.slug}
            project={project}
            selected={project.slug === selectedProject.slug}
            onSelect={() => setSelectedSlug(project.slug)}
            liveLabel={t.live}
            sourceLabel={t.source}
          />
        ))}
      </div>
      <ProjectPreview project={selectedProject} lang={lang} liveLabel={t.live} sourceLabel={t.source} />

      {(() => {
        const ping = backendPing?.find((p) => p.name === selectedProject.name) ?? null;
        const spinner = (
          <svg className="h-7 w-7 animate-spin text-zinc-300 [animation-duration:3s] dark:text-zinc-700" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        );
        return (
          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-400" />
              </span>
              <span className="text-xs text-zinc-400 dark:text-zinc-600">
                {selectedProject.name} — {t.backendStatLatency}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <div className="flex h-8 items-center">
                  {pinging ? (
                    spinner
                  ) : (
                    <span key={`ms-${pingTick}`} className="animate-value-in text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-white">
                      {ping?.ok ? `${ping.ms}ms` : <span className="text-red-500 dark:text-red-400">—</span>}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-600">{t.backendStatResponse}</div>
              </div>
              <div>
                <div className="flex h-8 items-center">
                  {pinging ? (
                    spinner
                  ) : (
                    <span
                      key={`status-${pingTick}`}
                      className={`animate-value-in text-2xl font-bold font-mono tabular-nums ${ping?.ok ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}
                    >
                      {ping?.ok ? t.backendStatLive : "—"}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-600">{t.backendStatStatus}</div>
              </div>
              <div>
                <div className="flex h-8 items-center text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-white">{selectedProject.endpoints}</div>
                <div className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-600">{t.backendStatEndpoints}</div>
              </div>
              <div>
                <div className="flex h-8 items-center text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-white">{selectedProject.commits}</div>
                <div className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-600">{t.backendStatCommits}</div>
              </div>
            </div>
          </div>
        );
      })()}

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
              <Link
                href="/postmortems"
                className="mt-2 block w-full rounded-lg border border-zinc-200 py-2 text-center text-xs font-medium text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-500 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
              >
                {t.nextPage}
              </Link>
            </div>
          )}

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">{t.aboutStackTitle}</h3>
              <div className="mb-3 flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedSkill(null)}
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                    !selectedSkill
                      ? "border-[#FF8225] bg-[#FF8225] text-zinc-950"
                      : "border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-500 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
                  }`}
                >
                  {t.allSkills}
                </button>
                {skillList.map((skill) => (
                  <button
                    key={skill.label}
                    onClick={() => setSelectedSkill(selectedSkill === skill.label ? null : skill.label)}
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                      selectedSkill === skill.label
                        ? "border-[#FF8225] bg-[#FF8225] text-zinc-950"
                        : "border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-500 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
                    }`}
                  >
                    {skill.label}
                  </button>
                ))}
              </div>

              {activeSkill ? (
                <div className="flex flex-col gap-6">
                  {matchingProjects.length === 0 && matchingUpdates.length === 0 && matchingPostmortems.length === 0 && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-500">{t.noSkillMatches}</p>
                  )}
                  {matchingProjects.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">{t.projects}</h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {matchingProjects.map((project) => (
                          <ProjectCard
                            key={project.slug}
                            project={project}
                            selected={false}
                            onSelect={() => {}}
                            liveLabel={t.live}
                            sourceLabel={t.source}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {matchingUpdates.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">{t.updates}</h4>
                      <div className="flex flex-col gap-3">
                        {matchingUpdates.map((update) => (
                          <PostCard key={update.slug} post={update} basePath="/updates" />
                        ))}
                      </div>
                    </div>
                  )}
                  {matchingPostmortems.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">{t.postmortems}</h4>
                      <div className="flex flex-col gap-3">
                        {matchingPostmortems.map((postmortem) => (
                          <PostCard key={postmortem.slug} post={postmortem} basePath="/postmortems" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-zinc-400 dark:text-zinc-600">{t.skillEvidenceHint}</p>
              )}
            </div>
        </div>
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
        <header className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
          <div className="flex items-center gap-2 sm:shrink-0">
            <GithubLink />
            <LinkedinLink />
            <EmailLink />
            <LanguageToggle lang={lang} onChange={changeLang} />
            <ThemeToggle />
          </div>
        </header>

        {/* Page nav */}
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveView("projects")}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              activeView === "projects"
                ? "border-[#FF8225] bg-[#FF8225] text-zinc-950"
                : "border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-500 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
            }`}
          >
            {t.roleFullStack}
          </button>
          <Link
            href="/infrastructure"
            onClick={(e) => {
              e.preventDefault();
              setActiveView(activeView === "infrastructure" ? "projects" : "infrastructure");
            }}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              activeView === "infrastructure"
                ? "border-[#FF8225] bg-[#FF8225] text-zinc-950"
                : "border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-500 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
            }`}
          >
            {t.infrastructure}
          </Link>
          <Link
            href="/postmortems"
            onClick={(e) => {
              e.preventDefault();
              setActiveView(activeView === "postmortems" ? "projects" : "postmortems");
            }}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              activeView === "postmortems"
                ? "border-[#FF8225] bg-[#FF8225] text-zinc-950"
                : "border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-500 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
            }`}
          >
            {t.postmortems}
          </Link>
          <Link
            href="/updates"
            onClick={(e) => {
              e.preventDefault();
              setActiveView(activeView === "documentation" ? "projects" : "documentation");
            }}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              activeView === "documentation"
                ? "border-[#FF8225] bg-[#FF8225] text-zinc-950"
                : "border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-500 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
            }`}
          >
            {t.documentationNav}
          </Link>
          <Link
            href="/about"
            onClick={(e) => {
              e.preventDefault();
              setActiveView(activeView === "about" ? "projects" : "about");
            }}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              activeView === "about"
                ? "border-[#FF8225] bg-[#FF8225] text-zinc-950"
                : "border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-500 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
            }`}
          >
            {t.aboutNav}
          </Link>
        </div>

        <div className="flex flex-col gap-12">
          {activeView === "about" ? (
            <AboutContent lang={lang} />
          ) : activeView === "infrastructure" ? (
            <InfrastructureContent lang={lang} />
          ) : activeView === "postmortems" ? (
            postmortemsSection
          ) : activeView === "documentation" ? (
            documentationSection
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
