"use client";

import { useRouter } from "next/navigation";

export function BackLink({ label = "← sacenpapier.org" }: { label?: string }) {
  const router = useRouter();

  return (
    <button
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push("/");
      }}
      className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
    >
      {label}
    </button>
  );
}
