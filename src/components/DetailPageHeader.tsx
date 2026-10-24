"use client";

import { SiteHeader } from "@/components/SiteHeader";
import { useLang } from "@/lib/useLang";

export function DetailPageHeader() {
  const { lang, changeLang } = useLang();
  return <SiteHeader variant="sub" backBehavior="history" lang={lang} onChangeLang={changeLang} />;
}
