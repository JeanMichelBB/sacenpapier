"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { projects } from "@/data/projects";
import { Postmortem } from "@/lib/postmortems";
import { ProjectCard } from "@/components/ProjectCard";
import { PostmortemCard } from "@/components/PostmortemCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GithubLink } from "@/components/GithubLink";
import { PodBadge } from "@/components/PodBadge";

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

export function Hub({ postmortems }: { postmortems: Postmortem[] }) {
  const [crushed, setCrushed] = useState(false);
  const [notFound, setNotFound] = useState<string | null>(null);

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
              <span><span className="text-red-500 dark:text-red-400">{notFound}.sacenpapier.org</span> does not exist.</span>
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
              A collection of personal projects — web apps, infra, and experiments.
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
          <div className="flex items-center gap-2">
            <GithubLink />
            <ThemeToggle />
          </div>
        </header>

        {/* Projects */}
        <section>
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Projects
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </section>

        {/* Infrastructure */}
        <section className="mt-12">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Infrastructure
          </h2>
          <a
            href="https://homelab.sacenpapier.org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-400" />
            </span>
            homelab.sacenpapier.org
          </a>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-600">
            Live infrastructure overview — k3s cluster, nodes, and pod routing.
          </p>
        </section>

        {/* Postmortems */}
        <section className="mt-12">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-600">
            Postmortems
          </h2>
          <div className="flex flex-col gap-3">
            {postmortems.map((postmortem) => (
              <PostmortemCard key={postmortem.slug} postmortem={postmortem} />
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 flex flex-col items-center gap-3 text-xs text-zinc-500 dark:text-zinc-600">
          <PodBadge />
          Built with Next.js · Deployed on k3s
        </footer>
      </div>
    </div>
  );
}
