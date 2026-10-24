"use client";

import { useEffect, useState } from "react";
import { strings, type Lang } from "@/lib/strings";

export function useLang() {
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

  return { lang, changeLang, t: strings[lang] };
}
