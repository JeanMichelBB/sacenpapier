"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { devices, production, integrations, type ServiceItem } from "@/data/homelab";

// Word-boundary-safe replace of integration names with links to their section.
// Longest names first so "Docker Hub" doesn't get clobbered by a shorter overlapping match.
const INTEGRATION_NAMES = [...integrations]
  .map((it) => ({ slug: it.slug, name: it.name.split("(")[0].trim().split(" + ")[0].trim() }))
  .sort((a, b) => b.name.length - a.name.length);

function linkify(text: string): string {
  let out = text;
  INTEGRATION_NAMES.forEach(({ slug, name }) => {
    const re = new RegExp("\\b" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "g");
    out = out.replace(re, `<a href="#int-${slug}" class="text-[#FF8225] hover:underline">${name}</a>`);
  });
  return out;
}

function deviceId(i: number) {
  return `dev-${i}`;
}

// A sidebar nav group: a device, or the Production/Integrations section — each with its
// own sub-list of service/item links underneath it.
type SidebarGroup = {
  id: string;
  label: string;
  os?: string;
  section: "Homelab" | "Production" | "Integrations";
  subItems: { id: string; name: string }[];
};

export function HomelabDocsContent() {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const [containerLeft, setContainerLeft] = useState(0);
  const [sidebarTop, setSidebarTop] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const introRef = useRef<HTMLParagraphElement | null>(null);
  const specificTargets = useRef<HTMLElement[]>([]);
  const deviceTargets = useRef<HTMLElement[]>([]);
  const rafScheduled = useRef(false);
  const navScrollRef = useRef<HTMLDivElement | null>(null);
  const navLinkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  const sidebarGroups: SidebarGroup[] = useMemo(() => {
    const groups: SidebarGroup[] = devices.map((d, i) => ({
      id: deviceId(i),
      label: d.model,
      os: d.os,
      section: "Homelab",
      subItems: (d.items ?? d.subgroups?.flatMap((sg) => sg.items) ?? []).map((it) => ({ id: `svc-${it.slug}`, name: it.name })),
    }));
    groups.push({
      id: "dev-production",
      label: "Deployed apps",
      section: "Production",
      subItems: production.items.map((it) => ({ id: `svc-${it.slug}`, name: it.name })),
    });
    groups.push({
      id: "dev-integrations",
      label: "Connective layer",
      section: "Integrations",
      subItems: integrations.map((it) => ({ id: `int-${it.slug}`, name: it.name })),
    });
    return groups;
  }, []);

  const navEntries = useMemo(() => sidebarGroups.map((g) => ({ id: g.id, label: g.label })), [sidebarGroups]);

  const q = query.trim().toLowerCase();
  const deviceMatches = (model: string, items: ServiceItem[]) =>
    !q || model.toLowerCase().includes(q) || items.some((it) => it.name.toLowerCase().includes(q));

  // Auto-open a group when search matches one of its sub-items, so the match is
  // actually visible instead of hidden behind a collapsed group.
  useEffect(() => {
    if (!q) return;
    setOpenGroups((prev) => {
      const next = new Set(prev);
      sidebarGroups.forEach((g) => {
        if (g.subItems.some((s) => s.name.toLowerCase().includes(q))) next.add(g.id);
      });
      return next;
    });
  }, [q, sidebarGroups]);

  // Auto-open whichever group owns the currently active (scroll-spy) item, and keep
  // that link comfortably in view within the sidebar's own scroll area — but only
  // scroll when it's actually near an edge, not on every single highlight change
  // (re-triggering a smooth scroll on every change during a fast scroll looks janky).
  useEffect(() => {
    if (!activeId) return;
    const owner = sidebarGroups.find((g) => g.id === activeId || g.subItems.some((s) => s.id === activeId));
    if (owner && owner.subItems.some((s) => s.id === activeId)) {
      setOpenGroups((prev) => (prev.has(owner.id) ? prev : new Set(prev).add(owner.id)));
    }
    const link = navLinkRefs.current[activeId];
    const container = navScrollRef.current;
    if (!link || !container) return;
    const cRect = container.getBoundingClientRect();
    const lRect = link.getBoundingClientRect();
    const margin = cRect.height * 0.15;
    const comfortablyInView = lRect.top >= cRect.top + margin && lRect.bottom <= cRect.bottom - margin;
    if (!comfortablyInView) {
      link.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [activeId, sidebarGroups]);

  // Tracks the content container's left edge (horizontal anchor) and the intro
  // paragraph's position in the document (vertical anchor) so the fixed-position
  // sidebar lines up with the actual page content instead of sitting at a guessed
  // constant — it should start level with that paragraph, not overlap the title above
  // it. `rect.top + scrollY` gives the paragraph's fixed distance from the very top of
  // the document, which is exactly the viewport offset it sits at when scrolled to top —
  // the right constant for a `position: fixed` element that should visually start there
  // and then stay put (matching the "follow the scroll" behavior already in place).
  useEffect(() => {
    function updatePos() {
      if (containerRef.current) setContainerLeft(containerRef.current.getBoundingClientRect().left);
      if (introRef.current) setSidebarTop(introRef.current.getBoundingClientRect().top + window.scrollY);
    }
    updatePos();
    window.addEventListener("resize", updatePos);
    return () => window.removeEventListener("resize", updatePos);
  }, []);

  // Below the md breakpoint: fall back to a normal drawer — anchored to the actual
  // viewport edge (not the content container) and opening left-to-right, instead of
  // the desktop's content-anchored, right-to-left panel. Little room on mobile for the
  // desktop layout's offset gutter.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // On mobile, with the drawer open: lock the page's own scroll so only the sidebar's
  // own list scrolls, matching the native drawer feel the user asked for.
  useEffect(() => {
    if (!isMobile || !sidebarOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isMobile, sidebarOpen]);

  // Classic scrollspy: a single trigger line 25% down the viewport, pick whichever
  // target's top most recently crossed it. IntersectionObserver was tried first and
  // misfired on tall elements (a tall section's bottom could already be inside the
  // "active band" while its top hadn't reached it yet) — this is exact, not approximate.
  useEffect(() => {
    function updateSpy() {
      const triggerY = window.innerHeight * 0.25;
      function pickCrossed(targets: HTMLElement[]) {
        let picked: HTMLElement | null = null;
        for (const el of targets) {
          if (el.getBoundingClientRect().top <= triggerY) picked = el;
          else break;
        }
        return picked;
      }
      const active = pickCrossed(specificTargets.current) || pickCrossed(deviceTargets.current);
      setActiveId(active?.id ?? deviceTargets.current[0]?.id ?? null);
      setShowBackToTop(window.scrollY > 400);
      setScrollY(window.scrollY);
    }
    function onScroll() {
      if (rafScheduled.current) return;
      rafScheduled.current = true;
      requestAnimationFrame(() => {
        rafScheduled.current = false;
        updateSpy();
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    updateSpy();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function registerDevice(el: HTMLElement | null) {
    if (el && !deviceTargets.current.includes(el)) deviceTargets.current.push(el);
  }
  function registerSpecific(el: HTMLElement | null) {
    if (el && !specificTargets.current.includes(el)) specificTargets.current.push(el);
  }

  function pillClass(id: string) {
    return `rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
      activeId === id
        ? "border-[#FF8225] bg-[#FF8225] text-zinc-950"
        : "border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-500 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
    }`;
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Sidebar — anchored to this container's own left edge (right: 100%) rather than
          the viewport, and opens by growing width leftward (away from the content) since
          its right edge stays pinned here. The reverse of the usual left-edge-anchored,
          grows-rightward drawer pattern. */}
      {/* Top rises to meet the viewport edge as you scroll past where it started —
          otherwise a fixed top equal to the intro paragraph's position leaves an empty
          gap above the sidebar once that paragraph has scrolled out of view. */}
      <button
        onClick={() => setSidebarOpen((v) => !v)}
        aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
        style={{
          left: isMobile ? (sidebarOpen ? 256 : 0) : containerLeft - 28,
          top: isMobile && sidebarOpen ? 0 : Math.max(0, sidebarTop - scrollY),
        }}
        className={`fixed z-30 border bg-white px-1.5 py-2 text-zinc-500 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-200 ${
          isMobile ? "rounded-r-md border-l-0" : "rounded-l-md border-r-0 border-zinc-200"
        }`}
      >
        {isMobile ? (sidebarOpen ? "‹" : "›") : sidebarOpen ? "›" : "‹"}
      </button>
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          aria-hidden
          className="fixed inset-0 z-10"
        />
      )}
      <div
        ref={navScrollRef}
        style={
          isMobile && sidebarOpen
            ? { left: 0, top: 0, maxHeight: "100vh" }
            : {
                left: isMobile ? 0 : containerLeft - (sidebarOpen ? 256 : 0),
                top: Math.max(0, sidebarTop - scrollY),
                maxHeight: `calc(100vh - ${Math.max(0, sidebarTop - scrollY)}px - 1.5rem)`,
              }
        }
        className={`fixed z-20 overflow-x-hidden overflow-y-auto bg-white transition-[width,left] duration-200 ease-out dark:bg-zinc-950 ${
          sidebarOpen ? "w-64" : "w-0"
        }`}
      >
        <nav className={`flex w-64 flex-col gap-0.5 px-3 pb-6 ${isMobile ? "text-left" : "text-right"}`}>
          {(["Homelab", "Production", "Integrations"] as const).map((section) => {
            const groups = sidebarGroups.filter((g) => g.section === section);
            const visible = groups.filter(
              (g) => !q || g.label.toLowerCase().includes(q) || g.subItems.some((s) => s.name.toLowerCase().includes(q))
            );
            if (!visible.length) return null;
            return (
              <div key={section}>
                <div className="mb-1 mt-3 px-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 first:mt-0 dark:text-zinc-600">
                  {section}
                </div>
                {visible.map((g) => {
                  const isOpen = openGroups.has(g.id);
                  return (
                    <div key={g.id} className="mb-0.5">
                      <a
                        href={`#${g.id}`}
                        ref={(el) => {
                          navLinkRefs.current[g.id] = el;
                        }}
                        onClick={() =>
                          setOpenGroups((prev) => {
                            const next = new Set(prev);
                            next.has(g.id) ? next.delete(g.id) : next.add(g.id);
                            return next;
                          })
                        }
                        className={`block rounded-md px-2 py-1.5 text-xs transition-colors ${
                          activeId === g.id
                            ? "bg-[#FF8225]/10 font-semibold text-[#FF8225]"
                            : "font-semibold text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
                        }`}
                      >
                        {g.label}
                        {g.os && <span className="ml-1.5 font-normal text-zinc-400 dark:text-zinc-600">{g.os}</span>}
                      </a>
                      {isOpen && (
                        <div className={`flex flex-col gap-0.5 ${isMobile ? "ml-2 pl-2" : "mr-2 pr-2"}`}>
                          {g.subItems
                            .filter((s) => !q || s.name.toLowerCase().includes(q))
                            .map((s) => (
                              <a
                                key={s.id}
                                href={`#${s.id}`}
                                ref={(el) => {
                                  navLinkRefs.current[s.id] = el;
                                }}
                                className={`rounded-md px-2 py-1 text-[11px] transition-colors ${
                                  activeId === s.id
                                    ? "bg-[#FF8225]/10 font-medium text-[#FF8225]"
                                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
                                }`}
                              >
                                {s.name}
                              </a>
                            ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </div>

      <p ref={introRef} className="mb-6 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Grouped by device (Homelab), then what&apos;s actually deployed (Production), then the connective
        layer that ties it all together (Integrations). Everything is written out on this one page,
        nothing hidden. Any mention of an integration (Tailscale, GitHub, Telegram, etc.) anywhere is a
        link down to its own section, which links back to everywhere it&apos;s used.
      </p>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter…"
        className="mb-4 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-600"
      />

      <div className="mb-10 flex flex-wrap gap-2">
        {navEntries.map((n) => (
          <a key={n.id} href={`#${n.id}`} className={pillClass(n.id)}>
            {n.label}
          </a>
        ))}
      </div>

      {/* Homelab */}
      <SectionHeading>Homelab</SectionHeading>
      {devices.map((dev, i) => {
        const items = dev.items ?? dev.subgroups?.flatMap((sg) => sg.items) ?? [];
        if (!deviceMatches(dev.model, items)) return null;
        return (
          <section key={dev.model} id={deviceId(i)} ref={registerDevice} className="mb-12 scroll-mt-20 border-t border-zinc-200 pt-6 first:border-t-0 first:pt-0 dark:border-zinc-800">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{dev.model}</h3>
            {dev.os && <div className="mb-2 text-xs text-zinc-400 dark:text-zinc-600">{dev.os}</div>}
            <p className="mb-2 text-sm italic text-zinc-500 dark:text-zinc-500">{dev.why}</p>
            {dev.network && (
              <div
                className="mb-5 rounded-lg bg-zinc-50 px-4 py-3 text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
                dangerouslySetInnerHTML={{ __html: `<b class="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-600">How it's wired</b>${linkify(dev.network)}` }}
              />
            )}
            {dev.subgroups
              ? dev.subgroups.map((sg) => (
                  <div key={sg.name}>
                    <div className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-600">{sg.name}</div>
                    {sg.items
                      .filter((it) => !q || it.name.toLowerCase().includes(q) || dev.model.toLowerCase().includes(q))
                      .map((it) => (
                        <ServiceBlock key={it.slug} item={it} registerRef={registerSpecific} />
                      ))}
                  </div>
                ))
              : items
                  .filter((it) => !q || it.name.toLowerCase().includes(q) || dev.model.toLowerCase().includes(q))
                  .map((it) => <ServiceBlock key={it.slug} item={it} registerRef={registerSpecific} />)}
          </section>
        );
      })}

      {/* Production */}
      <SectionHeading>Production</SectionHeading>
      <section id="dev-production" ref={registerDevice} className="mb-12 scroll-mt-20 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Production</h3>
        <p className="mb-5 text-sm italic text-zinc-500 dark:text-zinc-500">{production.why}</p>
        {production.items
          .filter((it) => !q || it.name.toLowerCase().includes(q))
          .map((it) => (
            <ServiceBlock key={it.slug} item={it} registerRef={registerSpecific} />
          ))}
      </section>

      {/* Integrations */}
      <SectionHeading>Integrations</SectionHeading>
      <section id="dev-integrations" ref={registerDevice} className="mb-12 scroll-mt-20 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Integrations</h3>
        <p className="mb-5 text-sm italic text-zinc-500 dark:text-zinc-500">
          The connective layer — not a device, not an app, but what lets everything above actually talk to each other and the outside world.
        </p>
        {integrations
          .filter((it) => !q || it.name.toLowerCase().includes(q))
          .map((it) => (
            <div key={it.slug} id={`int-${it.slug}`} ref={registerSpecific} className="mb-6 scroll-mt-20">
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">{it.name}</h4>
              <p className="mb-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{it.detail}</p>
              {it.usedIn.length > 0 && (
                <div className="text-xs text-zinc-400 dark:text-zinc-600">
                  <b className="mb-1 block font-semibold uppercase tracking-wide">Used in the homelab</b>
                  {it.usedIn.map((u) => (
                    <a key={u.href} href={u.href} className="mr-3 text-[#FF8225] hover:underline">
                      {u.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
      </section>

      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-20 rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-white shadow-lg hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          ↑ Top
        </button>
      )}
    </div>
  );
}

function SectionHeading({ children }: { children: string }) {
  return (
    <h2 className="mb-4 mt-10 text-xs font-semibold uppercase tracking-widest text-zinc-500 first:mt-0">{children}</h2>
  );
}

function ServiceBlock({
  item,
  registerRef,
}: {
  item: ServiceItem;
  registerRef: (el: HTMLElement | null) => void;
}) {
  return (
    <div id={`svc-${item.slug}`} ref={registerRef} className="mb-5 scroll-mt-20">
      <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">{item.name}</h4>
      <p
        className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400"
        dangerouslySetInnerHTML={{ __html: linkify(item.detail) }}
      />
      {item.links && (
        <a href={item.links} target="_blank" rel="noopener noreferrer" className="text-xs text-[#FF8225] hover:underline">
          {item.links}
        </a>
      )}
      {item.extLink && (
        <a href={item.extLink.href} className="text-xs text-[#FF8225] hover:underline">
          Full doc: {item.extLink.label} →
        </a>
      )}
    </div>
  );
}
