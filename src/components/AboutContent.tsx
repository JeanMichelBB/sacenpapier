import { strings, type Lang } from "@/lib/strings";

export function AboutContent({ lang }: { lang: Lang }) {
  const t = strings[lang];
  return (
    <div className="flex flex-col gap-4">
      {t.aboutText.map((paragraph, i) => (
        <p key={i} className="text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
          {paragraph}
        </p>
      ))}
    </div>
  );
}
